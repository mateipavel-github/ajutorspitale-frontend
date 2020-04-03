import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.css']
})
export class LoadingButtonComponent implements OnInit {


  @Input() loading = false;
  @Input() label;
  @Input() color = '';
  @Input() btnStyle = 'flat';
  @Input() btnDisabled = false;
  @Input() type = 'button';
  @Input() icon = '';
  @Input() showIcon = 'always';
  @Output() btnClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    console.log(this.icon);
  }

  onClick($event) {
    this.btnClick.emit($event);
  }

}
