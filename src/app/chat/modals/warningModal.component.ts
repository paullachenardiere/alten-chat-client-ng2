import {Component} from "@angular/core";
import {ModalComponent} from "./modal.component";
// declare let $: any;

@Component({
  selector: 'warning-modal',
  templateUrl: 'warningModal.component.html',
  styleUrls: ['modal.component.css']
})

export class WarningModalComponent extends ModalComponent {
}
