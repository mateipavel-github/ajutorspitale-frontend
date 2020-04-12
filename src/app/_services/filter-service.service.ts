import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';

@Injectable()
export class FilterService {

  protected defaultFilters = {};
  filters = {};
  filtersObservable$;

  constructor(protected dataService: DataService, protected authService: AuthService) {
    this.filtersObservable$ = new BehaviorSubject(this.defaultFilters);
  }

  public setFilter(filter, value, sendUpdates = false) {

    if (filter === 'needs') {
      value = value.map(need => {
        return need?.need_type?.id + ':' + need.quantity;
      });
    }

    this.filters[filter] = value;
    if (sendUpdates) {
      this.sendUpdates();
    }
  }

  public clearFilter(filter) {
    delete this.filters[filter];
  }

  public setFilters(filters) {
    this.filters = filters;
    this.sendUpdates();
  }

  public getFilters(key?) {
    return key ? this.filters[key] : this.filters;
  }

  public sendUpdates() {
    this.filtersObservable$.next(this.getFilters());
  }

}
