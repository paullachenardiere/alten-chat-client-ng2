import {Component} from '@angular/core';
import {Message} from "../model/Message";
import {ChatService} from "../chat.service";
import {ChatComponent} from "../chat.component";


@Component({
  selector: 'chat-message',
  inputs: ['message'],
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.css']
})
export class MessageComponent {
  public message: Message;
  private messages: any;
  public edit = false;
  public messageContainer: Message;

  constructor(public chatService: ChatService, public chatComponent: ChatComponent) {
    this.chatComponent = chatComponent;
  }


  replyMessage(id: number) {
    this.messageContainer.userId = 1;
    this.chatService.replyMessage(this.messageContainer, id).subscribe(
      message => {
        console.log("message", message);

        for (let i = 0; i < this.chatComponent.messages.length; i++) {
          if (this.chatComponent.messages[i].id === message.id) {
            this.chatComponent.messages.splice(i, 1);
            this.chatComponent.messages.push(message);
            break;
          }
        }


        return this.chatComponent.messages;
      },
      error => this.chatComponent.errorMessage = <any>error);
  }

  /**
   * Implemented in DOM
   */
  deleteMessage(id: number) {
    console.log("Delete message. ID=", id);
    let obs = this.chatService.deleteMessage(id);

    obs.subscribe(
      result => {

        console.log("result res res", result);
        for (let i = 0; i < this.chatComponent.messages.length; i++) {
          console.log("iteration ", i);
          if (this.chatComponent.messages[i].id === id) {
            console.log("match id", id);
            this.chatComponent.messages.splice(i, 1);
          }
        }
        return this.chatComponent.messages;


      },
      error => this.chatComponent.errorMessage = <any>error
    )

  }

  onClickEdit(message) {
    this.edit = !this.edit;
    if (this.edit) {
      this.messageContainer = message
    } else {
      this.messageContainer = new Message();
    }

  }

  onClickReply(parentId, userId) {
    this.edit = !this.edit;
    this.messageContainer = new Message();

    this.messageContainer.userId = userId;

  }
}
