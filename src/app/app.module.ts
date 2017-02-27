import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {MomentModule} from "angular2-moment/moment.module";

import {AppComponent} from './app.component';
import {EventFilteringComponent} from './event_filtering.component';
import {ChatService} from './chat/chat.service';
import {ChatComponent} from './chat/chat.component';
import {FooterComponent} from './footer/footer.component';
import {NavComponent} from './nav/nav.component';
import {SidemenuComponent} from './sidemenu/sidemenu.component';
import {MessageComponent} from "./chat/message/message.component";
import {ModalComponent} from "./chat/modals/modal.component";
import {DeleteModalComponent} from "./chat/modals/deleteModal.component";
import {UserModalComponent} from "./chat/modals/userModal.component";
import {MessageBodyComponent} from './chat/message-body/message-body.component';

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
    MessageBodyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MomentModule
  ],
  providers: [ChatService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
