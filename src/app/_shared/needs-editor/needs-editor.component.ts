import { EditRequestValidators } from './../_form-validators/edit-request-validators';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { startWith, map, debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-needs-editor',
  templateUrl: './needs-editor.component.html',
  styleUrls: ['./needs-editor.component.css']
})
export class NeedsEditorComponent implements OnInit {

  needsForm: FormGroup;
  needsFormLoading = false;

  filteredNeedTypes: Observable<any[]>;
  needTypeFilter: Subject<string> = new Subject<string>();
  currentNeedIndex = 0;

  @Input() canAdd = false;
  /* 
   * canSuggest this is supposed to have an effect on validators, nothing else. 
   * If set to true, user would be able to write anything in the needs editor without saving but also without an error
   */

  @Input() canSuggest = false;
  @Input() needs = [];
  @Input() fakeValue = 0;

  @Output() eventAddNew: EventEmitter<any> = new EventEmitter();
  @Output() eventAddNewError: EventEmitter<any> = new EventEmitter();
  @Output() needsUpdated: EventEmitter<any> = new EventEmitter();

  constructor(public dataService: DataService, private editRequestValidators: EditRequestValidators) {

  }

  ngOnInit(): void {

    this.needsForm = new FormGroup({
      'needs': new FormArray([])
    });

    /*
    this.needsForm.valueChanges.subscribe(data => {
      this.needsUpdated.emit(data.needs);
    });
    */

    this.filteredNeedTypes = this.needTypeFilter.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value['label']),
      map(label => label ? this._filter(label) : this.dataService.metadata['need_types'])
    );

    if (this.needs.length > 0) {
      this.setNeeds(this.needs);
    }
  }

  removeDiacritice(str) {
    str = str.toLowerCase();
    str = str.replace('ă', 'a');
    str = str.replace('â', 'a');
    str = str.replace('ș', 's');
    str = str.replace('ț', 't');
    str = str.replace('î', 'i');
    return str;
  }

  _filter(label) {
    let exactMatch = false;
    const filterValue = this.removeDiacritice(label);
    const list = this.dataService.metadata['need_types'].filter((need_type, index) => {
      if (this.removeDiacritice(need_type.label) === filterValue) {
        exactMatch = true;
      }
      return (
        this.removeDiacritice(need_type.label).indexOf(filterValue) === 0 ||
        this.removeDiacritice(need_type.label).indexOf(' ' + filterValue) > -1
      );
    });
    if (!exactMatch) {
      list.push({ id: 0, label: label });
    }
    return list;
  }

  public needsAutocompleteDisplay(needType) {
    return needType && needType.label ? needType.label : '';
  }

  public needTypeSelected($event) {
    const ctrl = (<FormArray>this.needsForm.get('needs')).controls[this.currentNeedIndex].get('need_type');
    if ($event.option.value.id === 0) {
      if (this.canAdd) {
        this.dataService.storeMetadataType({ metadata_type: 'need_types', label: $event.option.value.label })
          .subscribe(serverResponse => {
            if (serverResponse['success']) {
              const newMetadataItem = serverResponse['data']['new_item'];
              ctrl.setValue(newMetadataItem);
              this.needTypeFilter.next('');
              this.dataService.addMetadata(serverResponse['data']['metadata_type'], newMetadataItem);
              this.eventAddNew.emit(newMetadataItem);
              this.emitNeeds();
            } else {
              this.eventAddNewError.emit({ 'error': serverResponse['error'] });
            }
          });
      } else {
        this.eventAddNew.emit($event.option);
        this.needTypeFilter.next('');
      }
    } else {
      this.needTypeFilter.next('');
      this.emitNeeds();
    }
  }

  public getAsFormArray(key) {
    return <FormArray>this.needsForm.get(key);
  }

  clearNeeds() {
    this.getAsFormArray('needs').controls.splice(0, this.getAsFormArray('needs').length);
  }

  setNeeds(needs) {
    if (needs === undefined) {
      needs = [];
    }
    this.clearNeeds();
    needs.forEach(need => {
      if (need?.need_type_id) {
        need.need_type = { id: need?.need_type_id, label: this.dataService.getMetadataLabel('need_types', need?.need_type_id) };
      }
      this.onAddNeed(need);
    });
  }

  onAddNeed(data?) {

    const f = new FormGroup({
      need_type: new FormControl(data?.need_type,
        this.canAdd ? [this.editRequestValidators.NeedTypeValidator] : [this.editRequestValidators.NeedTypeSoftValidator]),
      quantity: new FormControl(data?.quantity, Validators.required)
    });

    f.get('quantity').valueChanges.pipe(debounceTime(300)).subscribe(value => {
      this.emitNeeds();
    });

    this.getAsFormArray('needs').push(f);
    const index = this.getAsFormArray('needs').length - 1;

    f.get('need_type').valueChanges.subscribe(val => {
      this.currentNeedIndex = index;
      if (typeof (val) === 'string') {
        this.needTypeFilter.next(val);
      }
    });
  }

  onRemoveNeed(action, i) {
    this.getAsFormArray('needs').removeAt(i);
    this.emitNeeds();
  }

  setCurrentNeed(index) {
    this.currentNeedIndex = index;
  }

  emitNeeds() {
    this.needsUpdated.emit(this.needsForm.get('needs').value);
  }

}
