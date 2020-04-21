import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject, empty } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-sponsor-autocomplete',
  templateUrl: './sponsor-autocomplete.component.html',
  styleUrls: ['./sponsor-autocomplete.component.css']
})
export class SponsorAutocompleteComponent implements OnInit {

  filteredOptions = [];
  isLoading = false;
  isAdding = false;

  @Input() canAdd = true;
  @Input() inputControl: FormControl = new FormControl();
  @Input() label = 'Sponsor';
  @Input() placeholder = 'Tastează pentru căutare...';
  @Output() addNew: EventEmitter<any> = new EventEmitter();
  @Output() addNewError: EventEmitter<any> = new EventEmitter();
  @Output() selected: EventEmitter<any> = new EventEmitter();

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        tap(() => {
          this.filteredOptions = [];
          this.isLoading = true;
        }),
        debounceTime(300),
        switchMap(value => {
          if (typeof (value) === 'string') {
            return this.dataService.getSponsors({ keyword: value })
              .pipe(
                finalize(() => {
                  this.isLoading = false;
                })
              );
          } else {
            return empty();
          }
        })
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
    if (typeof ($event.option.value) === 'string') {
      this.addNewItem(this.inputControl.value);
    } else {
      this.emitChange($event.option.value);
    }
  }

  addNewItem(v) {
    this.inputControl.disable();
    this.dataService.storeSponsor({ name: v })
      .subscribe(serverResponse => {
        this.inputControl.enable();
        if (serverResponse['success']) {
          const newItem = serverResponse['data']['new_item'];
          this.inputControl.setValue(newItem);
          this.addNew.emit(newItem);
        } else {
          this.addNewError.emit({ error: serverResponse['error'] });
        }
      }, error => {
        this.inputControl.enable();
        this.addNewError.emit({ error: error });
      });
  }

  emitChange(newOption) {
    this.selected.emit(newOption);
  }

  setValue(v) {
    this.inputControl.setValue(v);
  }

  clearValue() {
    this.inputControl.reset();
  }

  onBlur() {
    // console.log('Blur', this.inputControl.value);
  }

}
