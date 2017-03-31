import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {ChatService} from "../../services/chat.service";
import {LiveFeed} from "../model/LiveFeed";

@Component({
  selector: 'live-feed',
  templateUrl: 'live-feed.component.html',
  styleUrls: ['live-feed.component.css'],
})
export class LiveFeedComponent implements OnInit, OnDestroy {
  private liveFeed: LiveFeed[];
  private timeoutId;

  @Input('parentId') parentId: number;
  @Input('mainInput') mainInput: boolean;

  constructor(public chatService: ChatService) {
    this.timeoutId = setTimeout(() => {
      this.liveFeed = this.chatService.getCurrentLiveFeed();
      clearTimeout(this.timeoutId);
    }, 100);
  }

  ngOnInit() {
    this.getLiveFeed(this.parentId);
  }

  ngOnDestroy(): void {
    this.chatService.transferCurrentLiveFeed(this.liveFeed);
  }

  getLiveFeed(parentId: number) {
    if (this.parentId && !this.mainInput) {
      let liveFeed = this.chatService.getLiveFeed(parentId, this.mainInput);
      if (liveFeed) {
        liveFeed.subscribe(
          (msg) => {
            this.liveFeed = msg;
            console.log('this.liveFeed Comment', this.liveFeed, this.parentId);

          }
        )
      }
    }
    if (!this.parentId && this.mainInput) {

      let liveFeed = this.chatService.getLiveFeed(null, this.mainInput);
      if (liveFeed) {
        liveFeed.subscribe(
          (msg) => {
            this.liveFeed = msg;
            console.log('this.liveFeed MainInput', this.liveFeed);

          }
        )
      }
    }
  }

}
