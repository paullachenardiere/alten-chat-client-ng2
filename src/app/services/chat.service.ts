import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions, URLSearchParams} from "@angular/http";

// import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw'

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap'
import "rxjs/add/operator/publish";
import 'rxjs/add/operator/toPromise';
import {$WebSocket, WebSocketSendMode} from 'angular2-websocket/angular2-websocket';


import {Message} from "../chat/model/Message";
import {MessagePost} from "../chat/model/MessagePost";
import {WebSocketService} from "./webSocket.service";

@Injectable()
export class ChatService {

  public socket;
  public session;
  private baseUrl: string = "/api/altenchat/";
  public SESSION_ID_PREFIX: string = 'SESSION_ID=';
  public SESSION_ID: string;
  public isWriting: boolean = false;
  public messageContainer: Message;

  //TODO make persistent with localstorage...
  public unsubscribedMessages = {};

  // TODO Fix an external config file to handle different IP's
  private baseUrlSocket: string = "ws://10.46.4.188:8080/chat"; //JOBBET GuestNetwork
  // private baseUrlSocket: string = "ws://192.168.1.95:8080/chat"; //HEMMA (Paul)

  private headersGet = new Headers({'Accept': 'application/json'});
  private headersPost = new Headers({'Content-Type': 'application/json'});
  private messages;

  constructor(private http: Http, wsService: WebSocketService) {
    this.socket = this.establishSocketConnection();
    this.socket.onOpen(
      (session: MessageEventInit) => {
        this.session = session;
        console.info("onOpen session", this.session);
        console.info("onOpen this.socket", this.socket);
        console.log("session sessionId = ", this.session.sessionId);
        console.log("socket sessionId = ", this.socket.sessionId);
        this.getSessionId();
      }
    );
  }

  getSessionId() {
    this.socket.getDataStream().subscribe(
      (msg) => {
        let sessionId: string = msg.data;
        if (sessionId.indexOf(this.SESSION_ID_PREFIX) > -1) {
          sessionId = sessionId.substring(this.SESSION_ID_PREFIX.length, sessionId.length);
          this.SESSION_ID = sessionId;
          console.log('sessionId = ', this.SESSION_ID);
        }
      });

    this.socket.onMessage(
      (message) => {
        console.log('onmessage = ', message);
      })
  }

  establishSocketConnection(): any {
    let socket = new $WebSocket(this.baseUrlSocket);
    console.log('establishSocketConnection() = ', socket);
    return socket;
  };


  getAllMessagesSocket(): Observable<Message[]> {
    return this.socket.getDataStream();
  }

  getAllMessages(): Observable<Message[]> {
    return this.http.get(this.baseUrl, this.headersGet)
      .map(function (response: Response) {
        console.log('response', response);
        let res: Message[] = response.json();
        return res;
      })
      .catch(this.handleError);
  }

  postMessageSocket(message: Message) {
    console.log('postMessageSocket', message);
    this.socket.send(message).publish().connect();
  }

  postMessage(message: Message): Observable<Message> {
    console.log('postMessage', message);
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.post(this.baseUrl, message, options)
      .map(
        res => {
          let data = this.extractData(res);
          this.removeMessageFromCache(message.id);
          return data;
        })
      .catch(this.handleError);
  }


  getMessage(id: number): Observable<Message> {
    return this.http.get(this.baseUrl + id, this.headersGet)
      .map(function (response: Response) {
        let res = response.json();
        return res;
      })
      .catch(this.handleError);
  }

  getActiveSessions(): Observable<any> {
    return this.http.get(this.baseUrl + 'statistics', this.headersGet)
      .map(
        res => {
          let data = res.json();
          let stat = [];
          Object.keys(data).forEach(function (key) {
            console.log(key);
            stat.push({"id": key, "ip": data[key]});
          });
          console.log('statistics ', data);
          return stat;
        })
      .catch(this.handleError);
  }

  replyMessage(message: Message, id: number): Observable<Message> {
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.post(this.baseUrl + id, message, options)
      .map(
        res => {
          let data = this.extractData(res);
          this.removeMessageFromCache(id);
          return data;
        })
      .catch(this.handleError);
  }

  //FIXME Bad solution with 'any'. Need to control the types better in the earlier chain.
  editMessage(message: any): Observable<Response> {
    let messagePost: MessagePost = new MessagePost();
    messagePost.userId = message.user ? message.user.userId : message.userId;
    messagePost.id = message.id;
    messagePost.message = message.message;
    console.log('edit message', messagePost);
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.put(this.baseUrl, messagePost, options)
      .map(
        res => {
          let data = this.extractData(res);
          console.log("Response edit message", data);
          return data;
        })
      .catch(this.handleError);
  }

  deleteMessage(id: number): Observable<Response> {
    return this.http.delete(this.baseUrl + id + '/' + this.SESSION_ID)
      .map(res => {
        return res
      })
      .catch(this.handleError)

  }

  editReplyMessage(message: Message, id: number): Observable<Response> {
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.put(this.baseUrl + '{' + id + '}', message, options)
      .map(this.extractData)
      .catch(this.handleError);
  }


  // TODO Delete message (pathParam{1}) -DELETE
  // TODO Edit message -PUT
  // TODO Edit reply message (pathParam{1}) -PUT
  // TODO Get message (pathParam{1}) -GET
  // TODO Reply message (pathParam{1}) -POST


  private handleError(error: Response | any): Observable<any> {
    alert(error);
    return Observable.throw(error || 'Server error');
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  public removeMessageFromCache(id) {
    //TODO remove from localstorage
    if (this.unsubscribedMessages.hasOwnProperty(id)) {
      console.log('removeMessageFromCache', id);
      delete this.unsubscribedMessages[id];
    }

  }

  messageIsValid(message: Message): boolean {
    if (!message || !message.message || message.message.length === 0) {
      console.log('Message is NOT valid');
      return false;
    }
    if (!message.message.replace(/\s/g, '').length) {
      console.log('Message is NOT valid');
      return false;
    }
    console.log('Message is valid. Message = ', message.message);
    return true;
  }
}
