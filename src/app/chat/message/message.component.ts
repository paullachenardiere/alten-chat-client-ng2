import {Component, Renderer} from '@angular/core';
import {Message} from "../model/Message";
import {ChatService} from "../../services/chat.service";
import {ChatComponent} from "../chat.component";
declare let $: any;


@Component({
  selector: 'chat-message',
  inputs: ['message'],
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.css', '../chat.component.css']
})
export class MessageComponent {

  public message: Message;
  private messages: any;
  public toggleInput = false;
  public edit = false;
  public showReplies = false;
  public messageContainer: Message;
  public errorMessage: any;

  // @ViewChild('someVar') el:ElementRef;

  constructor(public chatService: ChatService, public chatComponent: ChatComponent, private rd: Renderer) {
    this.chatComponent = chatComponent;
  }


  submit(id: number) {
    if (this.messageContainer.message.length > 0) {
      if (this.edit) {
        console.log('Submit', this.messageContainer);
        this.editMessage(this.messageContainer)
      } else {
        this.replyMessage(id);
      }
    }
  }

  editMessage(message: Message) {
    this.chatService.editMessage(message).subscribe(
      message => {
        this.toggleInput = false;
        return this.chatComponent.updateMessageInDOM(message);
      },
      error => this.errorMessage = <any>error);
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
  deleteMessage(id: number, index: number) {
    console.log("Delete message. ID=", id);
    let obs = this.chatService.deleteMessage(id);

    obs.subscribe(
      result => {
        for (let i = 0; i < this.chatComponent.messages.length; i++) {
          if (this.chatComponent.messages[i].id === id) {

            let chatMessage = document.getElementById(this.chatComponent.messages[i].id.toString());
            console.log("chatMessage element", parent);

            $(chatMessage).removeClass('show');
            // $(chatMessage).addClass('delete-message');
            let timeoutId = setTimeout(() => {
              this.chatComponent.messages.splice(i, 1);
            }, 1000);
          }
        }
        return this.chatComponent.messages;


      },
      error => this.chatComponent.errorMessage = <any>error
    )

  }

  onClickShowReplies() {
    this.showReplies = !this.showReplies;
  }

  onEnter(id: number) {
    this.submit(id);
    console.log("onEnter", id)
  }

  onClickEdit(message) {
    this.edit = true;
    this.toggleInput = !this.toggleInput;
    this.messageContainer = message;
    this.messageContainer.userId = message.user.id;
  }

  onClickReply(parentId, userId) {
    this.edit = false;
    console.log('onClickReply');
    this.toggleInput = !this.toggleInput;
    this.messageContainer = new Message();

    this.messageContainer.userId = userId;

  }
}

