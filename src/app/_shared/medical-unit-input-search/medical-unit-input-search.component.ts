import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-medical-unit-input-search',
  templateUrl: './medical-unit-input-search.component.html',
  styleUrls: ['./medical-unit-input-search.component.css']
})
export class MedicalUnitInputSearchComponent implements OnInit {

  @Input() label;
  @Input() inputControl;
  @Input() countyId = null;
  searchControl = new FormControl();
  filteredOptions = [];
  isLoading = false;
  errorMsg: string;

  @Output() selected: EventEmitter<any> = new EventEmitter();
  @Output() blurred: EventEmitter<any> = new EventEmitter();

  constructor(private dataService: DataService) {

  }

  ngOnInit() {
    this.inputControl.valueChanges
      .pipe(
        debounceTime(500),
        tap(() => {
          this.errorMsg = '';
          this.filteredOptions = [];
          this.isLoading = true;
        }),
        switchMap(value => this.dataService.getMedicalUnits(value, this.countyId)
          .pipe(
            finalize(() => {
              this.isLoading = false;
            })
          )
        )
      )
      .subscribe(serverResponse => {
        if (serverResponse['success']) {
          this.filteredOptions = serverResponse['data']['items'];
        } else {
          this.filteredOptions = [];
        }
      });
  }

  displayFn(option): string {
    return option && option.name ? option.name : '';
  }

  onSelectionChange($event) {
    this.emitChange($event.option.value);
  }

  emitChange(value) {
    this.selected.emit(value);
  }

  clearValue() {
    this.emitChange({ id: 0, name: '' });
  }

  onBlur() {
    // console.log('Blur', this.inputControl.value);
  }


}
