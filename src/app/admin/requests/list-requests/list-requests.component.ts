import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-requests',
  templateUrl: './list-requests.component.html',
  styleUrls: ['./list-requests.component.css']
})
export class ListRequestsComponent implements OnInit {

  requestsLoaded = false;
  requests;
  filters = {flag: 'all'};

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router) {

    this.route.paramMap.pipe(switchMap((params) => {
      this.requestsLoaded = false;
      this.filters['flag'] = params.get('filter');
      return this.dataService.getRequests(this.filters);
    })).subscribe(serverResponse => {
      this.requestsLoaded = true;
      this.requests = serverResponse['data'];
    });

  }

  onAssign(requestId) {
    this.dataService.assignCurrentUserToRequest(requestId).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.requests.forEach((request, index) => {
          if (request.id === requestId) {
            this.requests[index].assigned_user = serverResponse['assigned_user'];
            this.requests[index].assigned_user_id = serverResponse['assigned_user_id'];
          }
        });
      }
    });
  }
  onUnassign(requestId) {
    this.dataService.unassignCurrentUserFromRequest(requestId).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.requests.forEach( (request, index) => {
          if (request.id === requestId) {
            this.requests[index].assigned_user_id = this.requests[index].assigned_user = null;
          }
        });
      } else {
        alert(serverResponse['error']);
      }
    });
  }

  onMassAssign(howMany) {
    this.dataService.assignCurrentUserToManyRequests(howMany).subscribe(serverResponse => {
      this.router.navigate(['/admin/requests/mine']);
    });
  }

  onChangeRequestStatus(requestId, status) {
    this.dataService.changeRequestStatus(requestId, status).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.requests.forEach((request, index) => {
          if (request.id === requestId) {
            request.status = status;
          }
        });
      } else {
        alert(serverResponse['error']);
      }
    });
  }

  ngOnInit(): void {
  }


}
