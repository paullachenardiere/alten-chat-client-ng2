import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {ChatService} from "./chat.service";
import {Message} from "./model/Message";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  public messages: Message[] = [];
  public message: Message;
  public newMessage: Message = new Message();
  public errorMessage: any;
  public data: Observable<Array<any>>;

  constructor(public chatService: ChatService) {
  }

  ngOnInit(): void {
    this.getAllMessages();
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

  getMessage(id: number) {
    this.chatService.getMessage(id).subscribe(
      message => this.message = message,
      error => this.errorMessage = <any>error
    );
  }

  /**
   * Implemented in DOM
   */
  postMessage() {
    this.newMessage.userId = 1;
    this.chatService.postMessage(this.newMessage).subscribe(
      message => {
        return this.updateMessageInDOM(message);
      },
      error => this.errorMessage = <any>error);
  }

  updateMessageInDOM(message): Array<Message> {
    console.log("message", message);
    this.messages.push(message);
    this.newMessage = new Message();
    return this.messages;
  };
}
