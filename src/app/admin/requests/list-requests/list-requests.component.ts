import { DataService } from '../../../_services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-requests',
  templateUrl: './list-requests.component.html',
  styleUrls: ['./list-requests.component.css']
})
export class ListRequestsComponent implements OnInit {

  requests;

  constructor(private dataService: DataService) {
    this.dataService.getRequests().subscribe(data => {
      this.requests = data['data'];
    });
  }

  ngOnInit(): void {
  }


}
