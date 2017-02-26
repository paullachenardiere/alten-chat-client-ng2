import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'event-filtering',
  template: '<input #myval (keyup.enter)="values=myval.value"><p>{{values}}</p>'
})
export class EventFilteringComponent {
  values='';
}
