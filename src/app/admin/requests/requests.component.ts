import { DataService } from './../../_services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.css']
})
export class RequestsComponent implements OnInit {

  requests;

  constructor(private dataService: DataService) {
    this.dataService.getRequests().subscribe(data => {
      this.requests = data['data'];
    });
  }

  ngOnInit(): void {
  }


}
