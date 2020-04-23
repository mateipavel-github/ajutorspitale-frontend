import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './../../../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { OffersFilterService } from './filter-form/offers-filter-service';


@Component({
  selector: 'app-offers',
  templateUrl: './list-offers.component.html',
  styleUrls: ['./list-offers.component.css'],
  providers: [ OffersFilterService ]
})
export class ListOffersComponent implements OnInit {

  offersLoaded = false;
  offers;
  flag = 'all';
  paging = { current: 1, last: 1, total: 0, per_page: 100 };

  // used for button loading states
  statusChanging = 0;
  assignChanging = 0;

  canEditDeliveryPlans = true;

  constructor(private dataService: DataService, private route: ActivatedRoute, private router: Router,
    public authService: AuthService, private filterService: OffersFilterService,
    private snackBar: MatSnackBar, private titleService: Title) {
    
    this.canEditDeliveryPlans = this.authService.hasAccess('deliveryplans.edit');

    this.filterService.filtersObservable$.pipe(switchMap(filters => {
      this.titleService.setTitle(filters['pageTitle'] + ' | Administrare@' + environment.appName);

      this.paging = { current: 1, last: 1, total: 0, per_page: 100 };
      return this.loadOffers(filters);
    })).subscribe(this.onOffersLoaded.bind(this), this.onOffersError.bind(this));

    this.route.paramMap.subscribe(params => {
      this.flag = params.get('flag');
      this.filterService.setFlag(this.flag);
    });

  }

  loadOffers(filters, page?) {
    this.offers = [];
    this.offersLoaded = false;
    return this.dataService.getOffers({ ...filters, ...{ per_page: this.paging.per_page, page: page ? page : this.paging.current } });
  }

  onOffersLoaded(serverResponse) {
    this.offersLoaded = true;
    this.offers = serverResponse['data']['items'];
    this.paging.current = serverResponse['data']['current_page'];
    this.paging.last = serverResponse['data']['last_page'];
    this.paging.total = serverResponse['data']['total'];
  }

  onOffersError(serverError) {
    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message: serverError['error'] },
      panelClass: 'snackbar-error',
      duration: 5000
    });
  }

  onPageChange(page) {
    this.loadOffers(this.filterService.getFilters(), page['pageIndex'] + 1).subscribe(this.onOffersLoaded.bind(this),
      this.onOffersError.bind(this));
  }

  onAssign(offerId) {
    this.assignChanging = offerId;
    this.dataService.assignCurrentUserToOffer(offerId).subscribe(serverResponse => {
      this.assignChanging = 0;
      if (serverResponse['success']) {
        this.offers.forEach((offer, index) => {
          if (offer.id === offerId) {
            this.offers[index].assigned_user = serverResponse['data']['assigned_user'];
            this.offers[index].assigned_user_id = serverResponse['data']['assigned_user']['id'];
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

  onUnassign(offerId) {
    this.assignChanging = offerId;
    this.dataService.unassignCurrentUserFromOffer(offerId).subscribe(serverResponse => {
      this.assignChanging = 0;
      if (serverResponse['success']) {
        this.offers.forEach( (offer, index) => {
          if (offer.id === offerId) {
            this.offers[index].assigned_user_id = this.offers[index].assigned_user = null;
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
    this.offersLoaded = false;

    this.dataService.assignCurrentUserToManyOffers(howMany).subscribe(serverResponse => {
      this.offersLoaded = true;
      this.router.navigate(['/admin/offers/mine']);
    });
  }

  onChangeOfferStatus(offerId, status) {
    this.statusChanging = offerId;
    this.dataService.changeOfferStatus(offerId, status).subscribe(serverResponse => {
      this.statusChanging = 0;
      if (serverResponse['success']) {
        this.offers.forEach((offer, index) => {
          if (offer.id === offerId) {
            offer.status = status;
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
