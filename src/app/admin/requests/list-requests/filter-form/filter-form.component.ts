import { FilterService } from './../filter-service/filter-service.service';
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';

@Component({
  selector: 'app-request-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css']
})
export class FilterFormComponent implements OnInit {

  filterForm: FormGroup;
  statusOptions = [];

  constructor(private dataService: DataService, private filterService: FilterService) {

    this.statusOptions = this.dataService.metadata.request_status_types.slice();
    this.statusOptions.push({'slug': 'new,approved,complete', label: 'Neprocesate, Validate sau Rezolvate' });

    this.filterForm = new FormGroup({
      'status': new FormControl()
    });

    this.filterForm.valueChanges.subscribe(changes => {
      console.log('Setting filters from form', this.filterForm.value);
      this.filterService.setFilter('status', this.filterForm.get('status').value, false);
      this.filterService.sendUpdates();
    });

    this.filterService.filtersObservable$.subscribe(filters => {
      this.filterForm.get('status').setValue(filters.status, { onlySelf: false, emitEvent: false });
    });
  }

  ngOnInit(): void {

  }

}

