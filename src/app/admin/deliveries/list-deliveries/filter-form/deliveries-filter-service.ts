import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { AuthService } from '../../../../_services/auth.service';
import { DataService } from 'src/app/_services/data.service';
import { Injectable } from '@angular/core';
import { FilterService } from '../../../../_services/filter-service.service';

@Injectable()
export class DeliveriesFilterService extends FilterService {

    protected defaultFilters = {
        per_page: 100,
        flag: 'all'
    };

    constructor(protected dataService: DataService, protected authService: AuthService) {
        super(dataService, authService);
    }

    public getStatusOptions() {
        const list = this.dataService.metadata['delivery_status_types'];
        return list;
    }

    public setFlag(flag) {
        this.flagToFilters(flag);
        this.sendUpdates();
    }

    public flagToFilters(flag) {
        switch (flag) {
            case 'all':
                delete this.filters['assigned_user_id'];
                this.filters['status'] = [];
                this.filters['pageTitle'] = 'Toate Livrările';
                break;
        }
    }

}
