import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterService } from './filter-service/filter-service.service';
import { AuthService } from './../../../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';

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
    private authService: AuthService, private filterService: FilterService, private snackBar: MatSnackBar) {

    this.filterService.filtersObservable$.pipe(switchMap(filters => {
      this.paging = { current: 1, last: 1, total: 0, per_page: 100 };
      return this.loadRequests(filters);
    })).subscribe(this.onRequestsLoaded.bind(this), this.onRequestsError.bind(this));

    this.route.paramMap.subscribe(params => {
      this.flag = params.get('flag');
      this.filterService.setFlag(this.flag);
    });

  }

  loadRequests(filters, page?) {
    this.requests = [];
    this.requestsLoaded = false;
    return this.dataService.getRequests({ ...filters, ...{ per_page: this.paging.per_page, page: page ? page : this.paging.current } });
  }

  onRequestsLoaded(serverResponse) {
    this.requestsLoaded = true;
    this.requests = serverResponse['data']['items'];
    this.paging.current = serverResponse['data']['current_page'];
    this.paging.last = serverResponse['data']['last_page'];
    this.paging.total = serverResponse['data']['total'];
  }

  onRequestsError(serverError) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message: serverError['error'] },
      panelClass: 'snackbar-error',
      duration: 5000
    });
  }

  onPageChange(page) {
    this.loadRequests(this.filterService.getFilters(), page['pageIndex'] + 1).subscribe(this.onRequestsLoaded.bind(this),
      this.onRequestsError.bind(this));
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
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['error'] },
            panelClass: 'snackbar-error',
            duration: 5000
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
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['error'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
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
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['error'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      }
    });
  }

  ngOnInit(): void {
  }


}
