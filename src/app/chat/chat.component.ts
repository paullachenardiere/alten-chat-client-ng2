import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Observable} from "rxjs";
import {ChatService} from "../services/chat.service";
import {Message} from "./model/Message";
import {WarningModalComponent} from "./modals/warningModal.component";
declare let $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  public messages: Message[] = [];
  public message: Message;
  public newMessage: Message = new Message();
  public deletedMessage;
  public messageTextToCopy;
  public errorMessage: any;
  public data: Observable<Array<any>>;
  public useSockets: boolean = true;
  public session;
  public activeSessions: number = 0;

  @ViewChild(WarningModalComponent)
  public readonly warningModal: WarningModalComponent;

  constructor(public chatService: ChatService) {
  }


  ngOnInit(): void {
    this.subscribeToSocketStream();
    this.chatService.socket.onOpen(
      (session: MessageEventInit) => {
        this.session = session;
        console.info("ChatComponent onOpen session", this.session);
      }
    );
    this.chatService.socket.onClose(
      (session: MessageEventInit) => {
        this.session = session;
        console.info("ChatComponent onClose session", this.session);
      }
    );

    if (this.useSockets) {
      this.getAllMessages();
      this.getActiveSessions();
      // this.getAllMessagesSocket();
    } else {
      // this.getAllMessages();
    }
  }

  ngOnDestroy() {
    console.log('ngOnDestroy() ', this.session);
    this.session.unsubscribe();
  }

  getAllMessages() {
    this.chatService.getAllMessages().subscribe(
      messages => this.messages = messages,
      error => this.errorMessage = <any>error
    );
  }

  subscribeToSocketStream() {

    this.chatService.socket.getDataStream().subscribe(
      (msg) => {
        let newMessage: Message;

        if (msg.data.indexOf(this.chatService.SESSION_ID_PREFIX) > -1) {
          return;
        } else {
          newMessage = JSON.parse(msg.data);
          console.log("incoming Message", newMessage);
        }

        if (newMessage.deleted) {
          this.deletedMessage = newMessage;
          console.log("Message to delete", this.deletedMessage);
          //TODO check of the user writes on the specific message, than warn that the message will be removed..
          console.log('incoming message sessionId ', newMessage.sessionId);
          console.log('Current SESSION_ID', this.chatService.SESSION_ID);
          if (newMessage.sessionId != this.chatService.SESSION_ID) {

            if (this.chatService.isWriting) {
              this.messageTextToCopy = this.chatService.unsubscribedMessages[this.deletedMessage.id].message || '';
              this.warningModal.show();
            }
          }
          this.deleteMessageInDOM(newMessage.id);
          return;
        }

        if (newMessage.edited) {
          console.log("incoming message is edited");
          this.editMessageInDOM(newMessage);
          return;
        }


        if (newMessage.hasOwnProperty('replies') && newMessage.replies.length > 0) {
          for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].id === newMessage.id) {
              this.messages.splice(i, 1);
              break;
            }
          }
        }
        this.updateMessageInDOM(newMessage);
      },
      (msg) => {
        console.log("error", msg);
        this.chatService.socket.close(false);
      },
      () => {
        console.log("complete");
      }
    );
  }

  deleteMessage(id: number, index: number) {
    console.log("Delete message. ID=", id);

    let obs = this.chatService.deleteMessage(id);

    obs.subscribe(
      result => {
        this.deleteMessageInDOM(id);
      },
      error => this.errorMessage = <any>error
    )
  }

  getAllMessagesSocket() {
    this.chatService.getAllMessagesSocket().subscribe(
      messages => this.messages = messages,
      error => this.errorMessage = <any>error
    );
  }

  getMessage(id: number) {
    this.chatService.getMessage(id).subscribe(
      message => this.message = message,
      error => this.errorMessage = <any>error
    );
  }

  getActiveSessions() {
    this.chatService.getActiveSessions().subscribe(
      activeSessions => {
        console.log("activeSessions = ", activeSessions);
        this.activeSessions = activeSessions;
      },
      error => this.errorMessage = <any>error
    );
  }

  postMessage() {

    this.postMessageRest();
    // this.postMessageSocket();
    this.newMessage = new Message();
    // }
  }

  onEnter(id: number) {
    this.postMessage();
    console.log("onEnter", id)
  }


  postMessageSocket() {
    this.newMessage.userId = 2;
    this.chatService.postMessageSocket(this.newMessage);
  }

  postMessageRest() {
    if (!this.chatService.messageIsValid(this.newMessage)) {
      return;
    }
    this.newMessage.userId = 1;
    this.chatService.postMessage(this.newMessage).subscribe(
      message => {
        // TODO update message in dom if no sockets is active
      },
      error => this.errorMessage = <any>error);
  }

  updateMessageInDOM(message): Array<Message> {
    console.log("message", message);

    this.messages.push(message);
    if (!this.messages || this.messages === undefined || this.messages.length === 0) return null;

    this.messages.sort((a: any, b: any) => {
      if (a.timestamp < b.timestamp) {
        return -1;
      } else if (a.timestamp > b.timestamp) {
        return 1;
      } else {
        return 0;
      }
    });

    this.newMessage = new Message();
    return this.messages;
  };

  private editMessageInDOM(message: Message) {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].id === message.id) {
        this.messages[i] = message;
        break;
      }
    }
  }

  private deleteMessageInDOM(id: number) {
    let chatMessage;
    let index;
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].id === id) {
        index = i;
        chatMessage = document.getElementById(this.messages[i].id.toString());
        console.log("chatMessage element", chatMessage);
        break;
      }
    }

    setTimeout(() => {
      $(chatMessage).removeClass('show');
    }, 200);

    // $(chatMessage).addClass('delete-message');
    setTimeout(() => {
      this.messages.splice(index, 1);
      console.log("timeoutId chatMessage", chatMessage);
    }, 500);
    return this.messages;
  }
}
