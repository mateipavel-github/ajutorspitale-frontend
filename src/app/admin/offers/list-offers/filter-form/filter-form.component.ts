import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { OffersFilterService } from './offers-filter-service';

@Component({
  selector: 'app-offers-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css']
})
export class OffersFilterFormComponent implements OnInit {

  filterForm: FormGroup;
  statusOptions = [];

  constructor(public dataService: DataService, private filterService: OffersFilterService) {

    this.statusOptions = this.filterService.getStatusOptions();

    this.filterForm = new FormGroup({
      'status': new FormControl(),
      'county': new FormControl()
    });

    this.filterForm.valueChanges.subscribe(changes => {

      Object.keys(this.filterForm.controls).forEach(key => {
        if (this.filterForm.value[key] !== undefined && this.filterForm.value[key] !== null) {
          this.filterService.setFilter(key, this.filterForm.value[key], false);
        } else {
          this.filterService.clearFilter(key);
        }
      });

      this.filterService.sendUpdates();
    });

    this.filterService.filtersObservable$.subscribe(filters => {
      Object.keys(this.filterForm.controls).forEach(key => {
        this.filterForm.get(key).setValue(filters[key], { onlySelf: false, emitEvent: false });
      });
    });
  }

  onClearFilter(key) {
    this.filterForm.get(key).reset();
  }

  ngOnInit(): void {

  }

}

