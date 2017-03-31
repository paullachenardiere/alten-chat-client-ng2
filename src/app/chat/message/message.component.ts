///<reference path="../live-feed/live-feed.component.ts"/>
import {Component, Renderer, Output} from '@angular/core';
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
  public expandView = false;
  public messageContainer: Message = new Message();
  public errorMessage: any;

  constructor(public chatService: ChatService, public chatComponent: ChatComponent, private rd: Renderer) {
    this.chatComponent = chatComponent;
  }

  submit(id: number) {
    if (this.chatService.messageIsValid(this.messageContainer)) {
      if (this.edit) {
        console.log('Submit edit', this.messageContainer);
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

  deleteMessage(id: number, index: number) {
    this.chatComponent.deleteMessage(id, index);

  }

  onClickShowReplies(parentId, userId) {
    this.edit = false;
    this.showReplies = !this.showReplies;
    if (this.showReplies) {
      this.toggleInput = true;
      this.expandView = true;
    } else {
      this.toggleInput = !this.toggleInput;
      this.expandView = !this.expandView;
    }

    let chatMessage = document.getElementById(this.message.id.toLocaleString());
    let repliesContainer = chatMessage.getElementsByClassName('repliesContainer');

    setTimeout(() => {
      if (!this.expandView) {
        $(repliesContainer).removeClass('showRepliesContainer');
      } else {
        $(repliesContainer).addClass('showRepliesContainer');
      }

      console.log("repliesContainer element", repliesContainer);
    }, 100);

    console.log('onClickReply');
    // this.toggleInput = !this.toggleInput;
    this.messageContainer = new Message();
    this.messageContainer.userId = userId;
    if (this.chatService.unsubscribedMessages.hasOwnProperty(parentId)) {
      this.messageContainer.message = this.chatService.unsubscribedMessages[parentId];
    }

  }

  onEnter(id: number, event) {
    event.stopPropagation();
    this.submit(id);
    console.log("onEnter", id)
  }

  onFormFocus(id: number) {
    this.chatService.onFormFocus(id, this.messageContainer);
  }

  onFormBlur(id: number) {
    this.chatService.onFormBlur(id, this.messageContainer);
  }

  onClickEdit(message) {
    this.edit = true;

    if (this.showReplies) {
      this.toggleInput = true;
      this.showReplies = false;
      this.expandView = true;
    } else {
      this.expandView = !this.expandView;
      this.toggleInput = !this.toggleInput;
    }
    this.messageContainer = message;
    this.messageContainer.userId = message.user.id;

    let chatMessage = document.getElementById(this.message.id.toLocaleString());
    let repliesContainer = chatMessage.getElementsByClassName('repliesContainer');

    setTimeout(() => {
      if (!this.expandView) {
        $(repliesContainer).removeClass('showRepliesContainer');
      } else {
        $(repliesContainer).addClass('showRepliesContainer');
      }

      console.log("repliesContainer element", repliesContainer);
    }, 100);
  }

  onClickReply(parentId, userId) {

  }
}

