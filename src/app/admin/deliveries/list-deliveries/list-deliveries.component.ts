import { DeliveriesFilterService } from './filter-form/deliveries-filter-service';
import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/_services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/_services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';

@Component({
  selector: 'app-list-deliveries',
  templateUrl: './list-deliveries.component.html',
  styleUrls: ['./list-deliveries.component.css'],
  providers: [ DeliveriesFilterService ]
})
export class ListDeliveriesComponent implements OnInit {

  listLoaded = false;
  items = [];
  flag = 'all';
  paging = { current: 1, last: 1, total: 0, per_page: 100 };

  // used for button loading states
  statusChanging = 0;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
    public authService: AuthService, public filterService: DeliveriesFilterService,
    private snackBar: MatSnackBar, private titleService: Title) {

    this.filterService.filtersObservable$.pipe(switchMap(filters => {
      this.titleService.setTitle(filters['pageTitle'] + ' | Administrare@' + environment.appName);

      this.paging = { current: 1, last: 1, total: 0, per_page: 100 };
      return this.loadItems(filters);
    })).subscribe(this.onListLoaded.bind(this), this.onListError.bind(this));

    this.route.paramMap.subscribe(params => {
      this.flag = params.get('flag');
      this.filterService.setFlag(this.flag);
    });

  }

  loadItems(filters, page?) {
    this.items = [];
    this.listLoaded = false;
    return this.dataService.getDeliveries({ ...filters, ...{ per_page: this.paging.per_page, page: page ? page : this.paging.current } });
  }

  onListLoaded(serverResponse) {
    this.listLoaded = true;
    this.items = serverResponse['data']['items'];
    this.paging.current = serverResponse['data']['current_page'];
    this.paging.last = serverResponse['data']['last_page'];
    this.paging.total = serverResponse['data']['total'];
  }

  onListError(serverError) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message: serverError['error'] },
      panelClass: 'snackbar-error',
      duration: 5000
    });
  }

  onPageChange(page) {
    this.loadItems(this.filterService.getFilters(), page['pageIndex'] + 1).subscribe(this.onListLoaded.bind(this),
      this.onListError.bind(this));
  }

  onChangeItemStatus(itemId, status) {
    this.statusChanging = itemId;
    this.dataService.changeDeliveryStatus(itemId, status).subscribe(serverResponse => {
      this.statusChanging = 0;
      if (serverResponse['success']) {
        this.items.forEach((item, index) => {
          if (item.id === itemId) {
            item.status = status;
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
