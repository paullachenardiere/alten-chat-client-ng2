import {Component, Input, ViewChild} from '@angular/core';
import {Message} from "../model/Message";
import {MessageComponent} from "../message/message.component";
import {DeleteModalComponent} from "../modals/deleteModal.component";
import {UserModalComponent} from "../modals/userModal.component";
import {MessagePost} from "../model/MessagePost";
import {ChatComponent} from "../chat.component";

@Component({
  selector: 'message-body',
  inputs: ['message'],
  outputs: ['edit'],
  templateUrl: 'message-body.component.html',
  styleUrls: ['../message/message.component.css']
})

export class MessageBodyComponent {
  @ViewChild(DeleteModalComponent)
  public readonly deleteModal: DeleteModalComponent;
  @ViewChild(UserModalComponent)
  public readonly userModal: UserModalComponent;
  public edit = false;
  public showReplies = false;
  public errorMessage: any;
  public viewFullMessage: boolean = false;

  @Input() messageReplies: Message[];

  constructor(public messageComponent: MessageComponent, public chatComponent: ChatComponent) {
    this.chatComponent = chatComponent;
    this.messageComponent = messageComponent;

    if(this.messageReplies) {
        console.log('messageReplies is defined', this.messageReplies);
    }

  }

  viewMessage() {
    this.viewFullMessage = !this.viewFullMessage;
    // document.getElementById("myDetails");

    // let messageElement = document.getElementById('text');
    // console.log("Message id", id,messageElement);
    // messageElement.open = true;
  }

  onClickReply(parentId: number, userId: number) {
    this.messageComponent.onClickReply(parentId, userId);
  }

  onClickEdit(message) {
    this.edit = !this.edit;
    this.messageComponent.onClickEdit(message)
  }
  onClickShowReplies(parentId: number, userId: number) {
    this.showReplies = !this.showReplies;
    this.messageComponent.onClickShowReplies(parentId, userId);
    this.messageComponent.onClickReply(parentId, userId);


  }

  deleteMessage(id: number, index: number) {
    this.messageComponent.deleteMessage(id, index);
  }

}
