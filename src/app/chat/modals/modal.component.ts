import {Component} from "@angular/core";
declare let $: any;

@Component({
  // selector: 'user-modal',
  templateUrl: 'userModal.component.html'
})

export class ModalComponent {

  public visible = false;
  public visibleAnimate = false;

  public show(): void {
    if (!this.visible) {
      $('<div class="modal-backdrop"></div>').appendTo(document.body);
      this.visible = true;
      setTimeout(() => this.visibleAnimate = true);
    }
  }

  public hide(): void {
    $(".modal-backdrop").remove();
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
  }
}
