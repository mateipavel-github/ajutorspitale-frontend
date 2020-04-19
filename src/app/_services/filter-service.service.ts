import { Observable, Subject, BehaviorSubject, empty } from 'rxjs';
import { AuthService } from './auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';
import { debounceTime, switchMap } from 'rxjs/operators';

@Injectable()
export class FilterService {

  public items$;
  protected loading = false;
  protected paging = { current: 1, last: 1, total: 0, per_page: 100 };

  protected dataServiceMethod = 'getRequests';

  protected defaultFilters = {};
  filters = {};
  filtersObservable$;

  constructor(protected dataService: DataService, protected authService: AuthService) {
    this.filtersObservable$ = new BehaviorSubject(this.defaultFilters);
    this.items$ = new Subject();
  }

  public setFilter(filter, value, sendUpdates = false) {
    this.filters[filter] = value;
    console.log('Setting filter ' + filter, value, sendUpdates);
    if (sendUpdates) {
      this.sendUpdates();
    }
  }

  public setFilters(filters) {
    this.filters = filters;
    this.sendUpdates();
  }

  public clearFilter(filter) {
    delete this.filters[filter];
  }

  public getFilters(key?) {
    return key ? this.filters[key] : this.filters;
  }

  public sendUpdates() {
    this.filtersObservable$.next(this.getFilters());
  }

  public forServer(filters) {
    Object.keys(filters).forEach(key => {
      if (key === 'needs') {
        filters[key] = filters[key].map(need => {
          return (need?.need_type?.id || need?.need_type_id) + ':' + need.quantity;
        });
      }
    });
    return filters;
  }


  public init() {
    this.filtersObservable$.pipe(
      debounceTime(300),
      switchMap((filters) => {
        console.log('filters updated, performing search: ', filters);
        return this.loadItems(filters);
      })
    ).subscribe(this.onItemsLoaded.bind(this), this.onLoadError.bind(this));
  }

  loadItems(filters, page?) {

    this.items$.next([]);
    this.loading = true;

    filters = this.forServer(filters);

    return this.dataService[this.dataServiceMethod](
      { ...filters, ...{ per_page: this.paging.per_page, page: page ? page : this.paging.current } }
    );
  }

  onItemsLoaded(serverResponse) {
    this.loading = false;
    this.items$.next(serverResponse['data']['items']);
    this.paging.current = serverResponse['data']['current_page'];
    this.paging.last = serverResponse['data']['last_page'];
    this.paging.total = serverResponse['data']['total'];
  }

  onLoadError(serverError) {
    this.loading = false;
  }

}
