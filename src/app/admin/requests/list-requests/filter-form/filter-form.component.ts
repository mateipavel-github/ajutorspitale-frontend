import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { RequestsFilterService } from './requests-filter-service';

@Component({
  selector: 'app-requests-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css']
})
export class RequestsFilterFormComponent implements OnInit {

  filterForm: FormGroup;
  statusOptions = [];
  @Input() show = ['status', 'county', 'medical_unit_type_id'];

  constructor(public dataService: DataService, private filterService: RequestsFilterService) {

    this.statusOptions = this.filterService.getStatusOptions();

    this.filterForm = new FormGroup({
      'status': new FormControl(),
      'county': new FormControl(),
      'medical_unit_type_id': new FormControl(),
      'keyword': new FormControl()
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

  canShow(key) {
    return this.show.indexOf(key) > -1;
  }

  ngOnInit(): void {

  }

}

