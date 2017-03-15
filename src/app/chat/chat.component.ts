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
  public errorMessage: any;
  public data: Observable<Array<any>>;
  public useSockets: boolean = true;
  public session;
  public activeSessions: number = 0;

  @ViewChild(WarningModalComponent)
  public readonly warningModal: WarningModalComponent;

  constructor(public chatService: ChatService) {
    this.subscribeToSocketStream();
  }


  ngOnInit(): void {
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

  /**
   * Implemented in DOM
   */

  getAllMessages() {
    this.chatService.getAllMessages().subscribe(
      messages => this.messages = messages,
      error => this.errorMessage = <any>error
    );
  }

  subscribeToSocketStream() {

    this.chatService.socket.getDataStream().subscribe(
      (msg) => {
        let newMessage: Message = JSON.parse(msg.data);

        if (newMessage.deleted) {
          this.deletedMessage = newMessage;
          console.log("Message to delete", this.deletedMessage);
           //TODO check of the user writes on the specific message, than warn that the message will be removed..
          this.warningModal.show();
          // this.deleteMessageInDOM(newMessage.id);
          return;
        }

        console.log("newMessage", newMessage);

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

  postMessageSocket() {
    this.newMessage.userId = 2;
    this.chatService.postMessageSocket(this.newMessage);
  }


  /**
   * Implemented in DOM
   */
  postMessageRest() {
    this.newMessage.userId = 2;
    this.chatService.postMessage(this.newMessage).subscribe(
      message => {
        // return this.updateMessageInDOM(message);
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
