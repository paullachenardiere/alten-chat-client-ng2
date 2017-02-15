import {Component, OnInit} from '@angular/core';
import {Message} from "../model/Message";

@Component({
  selector: 'chat-message',
  inputs: ['message'],
  templateUrl: 'message.component.html',
  styleUrls: ['message.component.css']
})
export class MessageComponent implements OnInit {
  public message: Message;

  constructor() {
  }


  ngOnInit() {
  }

}
