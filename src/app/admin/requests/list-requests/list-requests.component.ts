import { FilterService } from './filter-service/filter-service.service';
import { AuthService } from './../../../_services/auth.service';
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
  flag = 'all';
  paging = { current: 1, last: 1, total: 0, per_page: 100 };

  // used for button loading states
  statusChanging = 0;
  assignChanging = 0;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
    private authService: AuthService, private filterService: FilterService) {

    this.filterService.filtersObservable$.subscribe(filters => {
      this.requests = [];
      this.paging = { current: 1, last: 1, total: 0, per_page: 100};
      this.requestsLoaded = false;
      this.dataService.getRequests(filters).subscribe(serverResponse => {
        this.requestsLoaded = true;
        this.requests = serverResponse['data']['items'];
        this.paging.current = serverResponse['data']['current_page'];
        this.paging.last = serverResponse['data']['last_page'];
        this.paging.total = serverResponse['data']['total'];
      });
    });

    this.route.paramMap.subscribe(params => {
      this.flag = params.get('flag');
      this.filterService.setFlag(this.flag);
    });

  }

  onPageChange(page) {
    console.log('gotopage', page);
  }

  onAssign(requestId) {
    this.assignChanging = requestId;
    this.dataService.assignCurrentUserToRequest(requestId).subscribe(serverResponse => {
      this.assignChanging = 0;
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
    this.assignChanging = requestId;
    this.dataService.unassignCurrentUserFromRequest(requestId).subscribe(serverResponse => {
      this.assignChanging = 0;
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
    this.requestsLoaded = false;

    this.dataService.assignCurrentUserToManyRequests(howMany).subscribe(serverResponse => {
      this.requestsLoaded = true;
      this.router.navigate(['/admin/requests/mine']);
    });
  }

  onChangeRequestStatus(requestId, status) {
    this.statusChanging = requestId;
    this.dataService.changeRequestStatus(requestId, status).subscribe(serverResponse => {
      this.statusChanging = 0;
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
