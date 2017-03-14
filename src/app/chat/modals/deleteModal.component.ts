import {Component} from "@angular/core";
import {ModalComponent} from "./modal.component";
// declare let $: any;

@Component({
  selector: 'delete-modal',
  templateUrl: 'deleteModal.component.html',
  styleUrls: ['modal.component.css']
})

export class DeleteModalComponent extends ModalComponent {
}
