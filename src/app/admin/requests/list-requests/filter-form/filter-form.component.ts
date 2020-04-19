import { Component, Output, EventEmitter, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { RequestsFilterService } from './requests-filter-service';
import { NeedsEditorComponent } from 'src/app/_shared/needs-editor/needs-editor.component';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-requests-filter-form',
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css']
})
export class RequestsFilterFormComponent implements OnInit, AfterViewInit {

  filterForm: FormGroup;
  statusOptions = [];
  componentsReady$: ReplaySubject<any> = new ReplaySubject();

  @Input() show = ['status', 'county', 'medical_unit_type_id'];
  @Input() layout = 'horizontal';

  @ViewChild('filterByNeeds') needsEditor: NeedsEditorComponent;

  constructor(public dataService: DataService, private filterService: RequestsFilterService) {

    this.statusOptions = this.filterService.getStatusOptions();

    this.filterForm = new FormGroup({
      'status': new FormControl(),
      'county': new FormControl(),
      'medical_unit_type_id': new FormControl(),
      'keyword': new FormControl(),
      'needs': new FormControl([])
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.componentsReady$.next();
    });
  }

  needsEditor_onNeedsUpdated(needs) {
    this.filterForm.get('needs').setValue(needs);
  }

  onClearFilter(key) {
    this.filterForm.get(key).reset();
  }

  canShow(key) {
    return this.show.indexOf(key) > -1;
  }

  ngOnInit(): void {

  }

  setFilter(key, value) {
    this.filterForm.get(key).setValue(value, { onlySelf: false, emitEvent: false });
    if (key === 'needs') {
      this.componentsReady$.subscribe(() => {
        if (this.canShow('needs')) {
          this.needsEditor.setNeeds(value);
        }
      });
    }
  }


}

