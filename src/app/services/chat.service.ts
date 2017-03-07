///<reference path="../../../node_modules/angular2-websocket/angular2-websocket.d.ts"/>
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
// import * as io from 'socket.io-client';
// import * as SockJS from 'sockjs-client';
// import * as Stomp from 'webstomp-client';
import {$WebSocket, WebSocketSendMode} from 'angular2-websocket/angular2-websocket';


import {Message} from "../chat/model/Message";
import {MessagePost} from "../chat/model/MessagePost";
import {WebSocketService} from "./webSocket.service";

@Injectable()
export class ChatService {

  private socket;
  private stompClient;
  private baseUrl: string = "/api/altenchat/";
  private baseUrlSocket: string = "ws://ws.localhost:8080/chat";
  // private baseUrlSocket: string = "ws.localhost:8080/chat";
  // private baseUrlSocket: string = "/socket";

  // private baseUrl: string = "http://localhost:8080/altenchat/";
  private headersGet = new Headers({'Accept': 'application/json'});
  private headersPost = new Headers({'Content-Type': 'application/json'});
  private messages;

  constructor(private http: Http, wsService: WebSocketService) {
    // this.socket = wsService.connect(this.baseUrlSocket);
    this.socket = new $WebSocket(this.baseUrlSocket);
    // this.socket.setSendMode(WebSocketSendMode.Direct);
    this.socket.onOpen(
      (connect: MessageEventInit) => {
        console.info("onOpen this.socket", this.socket);
        console.info("onOpen connect", connect);
      }
    );
  }

  onNewMessage(result): void {
    let message = JSON.parse(result.body);
    alert(message);
  }


  getAllMessagesSocket(): Observable<Message[]> {

    return this.socket.getDataStream();

  }


  getAllMessages(): Observable<Message[]> {
    return this.http.get(this.baseUrl, this.headersGet)
      .map(function (response: Response) {
        let res: Message[] = response.json();
        return res;
      })
      .catch(this.handleError);
  }

  postMessageSocket(message: Message) {
    this.socket.emit('/chat', message);
  }


  postMessage(message: Message): Observable<Message> {
    console.log('postMessage', message);
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.post(this.baseUrl, message, options)
      .map(
        res => {
          let data = this.extractData(res);
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


  replyMessage(message: Message, id: number): Observable<Message> {
    let options = new RequestOptions({headers: this.headersPost});
    return this.http.post(this.baseUrl + id, message, options)
      .map(
        res => {
          let data = this.extractData(res);
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
    return this.http.delete(this.baseUrl + id)
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

}
