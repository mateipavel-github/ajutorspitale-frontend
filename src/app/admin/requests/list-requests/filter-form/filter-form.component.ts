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

  constructor(public dataService: DataService, private filterService: FilterService) {

    this.statusOptions = this.dataService.metadata.request_status_types.slice();
    this.statusOptions.push({'slug': 'new,approved,processed,complete', label: 'Toate fără respinse' });

    this.filterForm = new FormGroup({
      'status': new FormControl(),
      'county_id': new FormControl(0),
      'medical_unit_type_id': new FormControl(0)
    });

    this.filterForm.valueChanges.subscribe(changes => {

      this.filterService.setFilter('status', this.filterForm.get('status').value, false);

      if (this.filterForm.value.county_id !== undefined) {
        this.filterService.setFilter('county_id', this.filterForm.value.county_id, false);
      } else {
        this.filterService.clearFilter('county_id');
      }

      if (this.filterForm.value.medical_unit_type_id !== undefined) {
        this.filterService.setFilter('medical_unit_type_id', this.filterForm.value.medical_unit_type_id, false);
      } else {
        this.filterService.clearFilter('medical_unit_type_id');
      }

      this.filterService.sendUpdates();
    });

    this.filterService.filtersObservable$.subscribe(filters => {
      this.filterForm.get('status').setValue(filters.status, { onlySelf: false, emitEvent: false });
      this.filterForm.get('county_id').setValue(filters.county_id, { onlySelf: false, emitEvent: false });
      this.filterForm.get('medical_unit_type_id').setValue(filters.medical_unit_type_id, { onlySelf: false, emitEvent: false });
    });
  }

  ngOnInit(): void {

  }

}

