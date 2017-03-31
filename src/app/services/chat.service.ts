import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions, URLSearchParams} from "@angular/http";

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
import {UserService} from "./user.service";
import {LiveFeed} from "../chat/model/LiveFeed";
import {Notification, Observer} from "rxjs";

@Injectable()
export class ChatService {

  notification$: Observable<any>;
  private observer: Observer<any>;
  private notifications: any = {};
  private observers: any = {};

  public socket;
  public session;
  private baseUrl: string = "/api/altenchat/";
  public SESSION_ID_PREFIX: string = 'SESSION_ID=';
  public SESSION_ID: string;
  public IS_WRITING_PREFIX: string = 'IS_WRITING=';
  private IS_WRITING: any = {};
  private IS_WRITING_LIST: string[] = [];
  // public HAS_STOPPED_WRITING_PREFIX: string = 'HAS_STOPPED_WRITING=';
  public isWriting: boolean = false;
  public messageContainer: Message;
  private currentLiveFeed: LiveFeed[];

  // TODO make persistent with localstorage...
  public unsubscribedMessages = {};

  // TODO Fix an external config file to handle different IP's
  private baseUrlSocket: string = "ws://10.46.5.33:8080/chat"; //JOBBET GuestNetwork
  // private baseUrlSocket: string = "ws://192.168.1.95:8080/chat"; //HEMMA (Paul)

  private headersGet = new Headers({'Accept': 'application/json'});
  private headersPost = new Headers({'Content-Type': 'application/json'});
  private messages;

  constructor(private http: Http, public userService: UserService) {

    this.socket = this.establishSocketConnection();
    this.socket.onOpen(
      (session: MessageEventInit) => {
        this.session = session;
        console.info("onOpen session", this.session);
        console.info("onOpen this.socket", this.socket);
        this.getSessionId();
      }
    );
  }

  establishSocketConnection(): any {
    let socket = new $WebSocket(this.baseUrlSocket);
    console.log('establishSocketConnection() = ', socket);
    return socket;
  };

  getLiveFeed(parentId: number, mainInput: boolean): Observable<any> {

    if (!this.socket) {
      return;
    }

    if (parentId !== null && !mainInput) {
      this.notification$ = new Observable(observer => {
        this.observers[parentId] = observer;
      });
      this.notifications[parentId] = this.notification$;
    } else {
      this.notification$ = new Observable(observer => {
        this.observers[0] = observer;
      });
      this.notifications[0] = this.notification$;
    }

    this.socket.getDataStream().subscribe(
      (msg) => {

        //FIXME prevent this from running on every message.

        if (msg.data.indexOf(this.IS_WRITING_PREFIX) > -1) {
          let liveFeed: LiveFeed;
          liveFeed = JSON.parse(msg.data.substring(this.IS_WRITING_PREFIX.length, msg.data.length));
          if (liveFeed.parentId === parentId) {
            console.info('Accepting', liveFeed.parentId, parentId);
            console.log('getLiveFeed', liveFeed);

            if (liveFeed.isWriting) {
              this.IS_WRITING[liveFeed.sessionId] = liveFeed;
            } else {
              delete this.IS_WRITING[liveFeed.sessionId];
            }


            this.IS_WRITING_LIST = [];
            for (let key in this.IS_WRITING) {
              if (this.IS_WRITING.hasOwnProperty(key)) {
                this.IS_WRITING_LIST.push(this.IS_WRITING[key]);
              }
            }
          }

          if ((this.observers[liveFeed.parentId] && liveFeed.parentId === parentId) && !mainInput) {
            console.info('Notifies observers', this.observers[liveFeed.parentId], liveFeed, parentId);
            this.observers[liveFeed.parentId].next(this.IS_WRITING_LIST.slice().reverse());
          } else if (mainInput && this.observers[0] && !liveFeed.parentId) {
            console.info('Notifies observer MAIN', this.observers[0], liveFeed, parentId);
            this.observers[0].next(this.IS_WRITING_LIST.slice().reverse());
          }

        }

      });

    if (mainInput) {
      return this.notifications[0];
    } else {
      return this.notifications[parentId];
    }
  };

  //TODO Implement delete subscribers/observer when deleting a message

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

    //FIXME remove this?
    this.socket.onMessage(
      (message) => {
        // console.log('onmessage = ', message);
      })
  }

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


  // TODO Implement Edit reply message (pathParam{1}) -PUT

  private handleError(error: Response | any): Observable<any> {
    alert(error);
    return Observable.throw(error || 'Server error');
  }

  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }

  onFormFocus(id: number, messageContainer: Message) {
    this.isWriting = true;

    if (this.SESSION_ID) {
      let liveFeed: LiveFeed = new LiveFeed(true, this.userService.getCurrentUser().firstName, this.SESSION_ID, id);
      this.socket.send(this.IS_WRITING_PREFIX + JSON.stringify(liveFeed)).publish().connect();
    }

    this.messageContainer = messageContainer;
    this.unsubscribedMessages[id] = this.messageContainer.message;
    console.log('Focus', this.unsubscribedMessages);
  }

  onFormBlur(id: number, messageContainer: Message) {
    let key = id || this.SESSION_ID;
    this.isWriting = false;
    messageContainer.message = messageContainer.message || '';
    if (!messageContainer.message || messageContainer.message === "" || messageContainer.message.length === 0) {
      this.removeMessageFromCache(key);
      let liveFeed = new LiveFeed(false, this.userService.getCurrentUser().firstName, this.SESSION_ID, id);
      this.socket.send(this.IS_WRITING_PREFIX + JSON.stringify(liveFeed)).publish().connect();
    } else {
      this.messageContainer = messageContainer;
      this.unsubscribedMessages[key] = this.messageContainer.message;
    }
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

  transferCurrentLiveFeed(liveFeed: LiveFeed[]) {
      this.currentLiveFeed = liveFeed;
  }

  getCurrentLiveFeed(): LiveFeed[] {
    return this.currentLiveFeed;
  }

  cleanObservers(id: number) {
    if(this.observers.hasOwnProperty(id)) {
      console.info('removing observers for message' , id);
        delete this.observers[id];
    }
    if(this.notifications.hasOwnProperty(id)) {
      console.info('removing notifications for message' , id);
      delete this.notifications[id];
    }
    if(this.unsubscribedMessages.hasOwnProperty(id)) {
      console.info('removing unsubscribedMessages for message' , id);
      delete this.unsubscribedMessages[id];
    }
  }
}
