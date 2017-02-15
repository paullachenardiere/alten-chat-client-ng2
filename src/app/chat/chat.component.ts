import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ChatService} from "./chat.service";
import {Message} from "./model/Message";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  private messages: Message[] = [];
  private message: Message;
  private newMessage: Message = new Message();
  private errorMessage: any;
  private data: Observable<Array<any>>;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.getAllMessages();
    // this.getMessage(2);
    // this.postMessage();
  }


  getAllMessages() {
    this.chatService.getAllMessages().subscribe(
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

  postMessage() {
    this.newMessage.userId = 1;
    this.chatService.postMessage(this.newMessage).subscribe(
      message => {
        return this.updateMessageInDOM(message);
      },
      error => this.errorMessage = <any>error);
  }

  replyMessage(id: number) {
    this.newMessage.userId = 1;
    this.chatService.replyMessage(this.newMessage, id).subscribe(
      message => {
        console.log("message", message);
        this.messages.push(message);

        return this.messages;
      },
      error => this.errorMessage = <any>error);
  }

  deleteMessage(id: number) {
    console.log("Delete message. ID=", id);
    let obs = this.chatService.deleteMessage(id);

    obs.subscribe(
      result => {
        console.log("result res res", result);
        for (let i = 0; i < this.messages.length; i++) {
          console.log("iteration ", i);
          if (this.messages[i].id === id) {
            console.log("match id", id);
            this.messages.splice(i, 1);
          }
        }
        return this.messages;


      },
      error => this.errorMessage = <any>error
    )

  }

  updateMessageInDOM(message): Array<Message> {
    console.log("message", message);
    this.messages.push(message);
    this.newMessage = new Message();
    return this.messages;
  };
}
