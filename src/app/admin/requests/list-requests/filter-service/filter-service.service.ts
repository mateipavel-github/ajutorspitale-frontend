import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../../_services/auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  defaultFilters = {
    'flag': 'all',
    'per_page': 100,
    'status': 1
  };

  filters = {};
  filtersObservable$;

  constructor(private dataService: DataService, private authService: AuthService) {
    this.filtersObservable$ = new BehaviorSubject(this.defaultFilters);
  }

  public setFilter(filter, value, sendUpdates = false) {
    this.filters[filter] = value;
    if (sendUpdates) {
      this.sendUpdates();
    }
  }

  public setFilters(filters) {
    this.filters = filters;
    this.sendUpdates();
  }
  public setFlag(flag) {
    this.flagToFilters(flag);
    this.sendUpdates();
  }

  public getFilters(key?) {
    return key ? this.filters[key] : this.filters;
  }

  public sendUpdates() {
    this.filtersObservable$.next(this.getFilters());
  }

  public flagToFilters(flag) {
    switch (flag) {
      case 'mine':
        this.filters['assigned_user_id'] = this.authService.currentUserValue.id;
        this.filters['status'] = '1,2,4';
        break;
      case 'unassigned':
        this.filters['assigned_user_id'] = null;
        this.filters['status'] = '1,2,4';
        break;
      case 'all':
        delete this.filters['assigned_user_id'];
        this.filters['status'] = '1,2,4';
        break;
    }
  }

}
