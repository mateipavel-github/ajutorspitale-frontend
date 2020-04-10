import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../../_services/auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';
import { FilterService } from '../../../../_services/filter-service.service';

@Injectable()
export class RequestsFilterService extends FilterService {

  protected defaultFilters = {
    per_page: 100,
    status: 'new,approved,processed,complete',
    flag: 'all'
  };

  constructor(protected dataService: DataService, protected authService: AuthService) {
    super(dataService, authService);
  }

  public getStatusOptions() {
    const list = this.dataService.metadata['request_status_types'];
    list.push({ 'slug': 'new,approved,processed,complete', label: 'Toate fără respinse' });
    return list;
  }

  public setFlag(flag) {
    this.flagToFilters(flag);
    this.sendUpdates();
  }

  public flagToFilters(flag) {
    switch (flag) {
      case 'mine':
        this.filters['assigned_user_id'] = this.authService.currentUserValue.id;
        this.filters['status'] = ['new', 'approved', 'processed', 'complete'];
        this.filters['pageTitle'] = 'Cererile mele';
        break;
      case 'unassigned':
        this.filters['assigned_user_id'] = null;
        this.filters['status'] = ['new', 'approved', 'processed', 'complete'];
        this.filters['pageTitle'] = 'Cereri nerespinse și neasignate';
        break;
      case 'all':
        delete this.filters['assigned_user_id'];
        this.filters['status'] = ['new', 'approved', 'processed', 'complete'];
        this.filters['pageTitle'] = 'Cereri nerespinse';
        break;
    }
  }

}
