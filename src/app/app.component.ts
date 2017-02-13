import {Component, OnInit} from '@angular/core';
import {ChatService} from './chat.service';
import {Observable} from 'rxjs/Observable';
import {Message} from "./Message";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private messages: any;
  private errorMessage: any;
  private data: Observable<Array<any>>;

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.getAllMessages();
    this.postMessage();
  }


  getAllMessages() {
    this.chatService.getAllMessages().subscribe(
      messages => this.messages = messages,
      error => this.errorMessage = <any>error
    );
  }


  postMessage() {

    let mess = new Message();
    mess.userId = 1;
    mess.message = "Testing a message from NG2 controller";

    this.chatService.postMessage(mess).subscribe(
      mess => this.messages.push(mess),
      error => this.errorMessage = <any>error);
  }

}
