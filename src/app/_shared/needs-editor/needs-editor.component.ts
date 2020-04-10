import { EditRequestValidators } from './../_form-validators/edit-request-validators';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { startWith, map } from 'rxjs/operators';

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

  @Output() eventAddNew: EventEmitter<any> = new EventEmitter();
  @Output() eventAddNewError: EventEmitter<any> = new EventEmitter();
  @Output() needsUpdated: EventEmitter<any> = new EventEmitter();

  constructor(public dataService: DataService, private editRequestValidators: EditRequestValidators) {

  }

  ngOnInit(): void {

    this.needsForm = new FormGroup({
      'needs': new FormArray([])
    });

    this.needsForm.valueChanges.subscribe(data => {
      this.needsUpdated.emit(data.needs);
    });

    this.filteredNeedTypes = this.needTypeFilter.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value['label']),
      map(label => label ? this._filter(label) : this.dataService.metadata['need_types'])
    );
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
    console.log('Need Type Selected', $event.option);
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
    }
  }

  public getAsFormArray(key) {
    return <FormArray>this.needsForm.get(key);
  }

  clearNeeds() {
    this.getAsFormArray('needs').controls.splice(0, this.getAsFormArray('needs').length);
  }

  setNeeds(needs) {
    console.log('Set needs: ', needs);
    this.clearNeeds();
    needs.forEach(need => {
      this.onAddNeed(need);
    });
  }

  onAddNeed(data?) {

    const f = new FormGroup({
      need_type: new FormControl(data?.need_type,
        this.canAdd ? [this.editRequestValidators.NeedTypeValidator] : [this.editRequestValidators.NeedTypeSoftValidator]),
      quantity: new FormControl(data?.quantity, Validators.required)
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
  }

  setCurrentNeed(index) {
    this.currentNeedIndex = index;
  }

}
