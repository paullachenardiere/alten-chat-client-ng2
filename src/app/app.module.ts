import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MomentModule} from "angular2-moment/moment.module";
import {ClipboardModule} from 'ngx-clipboard';

import {AppComponent} from './app.component';
import {EventFilteringComponent} from './event_filtering.component';
import {ChatComponent} from './chat/chat.component';
import {FooterComponent} from './footer/footer.component';
import {NavComponent} from './nav/nav.component';
import {SidemenuComponent} from './sidemenu/sidemenu.component';
import {MessageComponent} from "./chat/message/message.component";
import {ModalComponent} from "./chat/modals/modal.component";
import {DeleteModalComponent} from "./chat/modals/deleteModal.component";
import {UserModalComponent} from "./chat/modals/userModal.component";
import {MessageBodyComponent} from './chat/message-body/message-body.component';

import {ChatService} from './services/chat.service';
import {UserService} from "./services/user.service";
import {WebSocketService} from "./services/webSocket.service";
import {WarningModalComponent} from "./chat/modals/warningModal.component";
import { LiveFeedComponent } from './chat/live-feed/live-feed.component';
import {ReversePipe} from "./pipes.component";

@NgModule({
  declarations: [
    AppComponent,
    ChatComponent,
    FooterComponent,
    NavComponent,
    SidemenuComponent,
    MessageComponent,
    EventFilteringComponent,
    ModalComponent,
    DeleteModalComponent,
    UserModalComponent,
    WarningModalComponent,
    MessageBodyComponent,
    LiveFeedComponent,
    ReversePipe,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MomentModule,
    ClipboardModule,
  ],
  providers: [ChatService, WebSocketService, UserService],
  bootstrap: [AppComponent]
})

export class AppModule {
}
