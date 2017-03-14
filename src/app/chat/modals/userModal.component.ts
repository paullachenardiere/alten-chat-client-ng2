import {Component} from "@angular/core";
import {ModalComponent} from "./modal.component";
// declare let $: any;

@Component({
  selector: 'user-modal',
  templateUrl: 'userModal.component.html',
  styleUrls: ['modal.component.css']
})

export class UserModalComponent extends ModalComponent {
}
