import {Component, ViewChild} from '@angular/core';
import {Message} from "../model/Message";
import {ChatService} from "../chat.service";
import {ChatComponent} from "../chat.component";
import {DeleteModalComponent} from "../modals/deleteModal.component";
import {UserModalComponent} from "../modals/userModal.component";


@Component({
  selector: 'chat-message',
  inputs: ['message'],
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.css','../chat.component.css']
})
export class MessageComponent {

  @ViewChild(DeleteModalComponent)
  public readonly deleteModal: DeleteModalComponent;
  @ViewChild(UserModalComponent)
  public readonly userModal: UserModalComponent;

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
            // this.chatComponent.messages.push(message);
            break;
          }
        }
        this.chatComponent.updateMessageInDOM(message);

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
        for (let i = 0; i < this.chatComponent.messages.length; i++) {
          if (this.chatComponent.messages[i].id === id) {
            this.chatComponent.messages.splice(i, 1);
          }
        }
        return this.chatComponent.messages;


      },
      error => this.chatComponent.errorMessage = <any>error
    )

  }

  onEnter(id: number) {
    console.log("onEnter", id)
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

