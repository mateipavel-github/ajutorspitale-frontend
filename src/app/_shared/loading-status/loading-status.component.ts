import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-loading-status',
  templateUrl: './loading-status.component.html',
  styleUrls: ['./loading-status.component.css']
})
export class LoadingStatusComponent implements OnInit {

  @Input() loaded = false;
  constructor() { }

  ngOnInit(): void {
  }

}
