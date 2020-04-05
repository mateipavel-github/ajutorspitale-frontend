import { EditRequestValidators } from './../../../../_shared/_form-validators/edit-request-validators';
import { SessionDataService } from './../../../../_services/session-data.service';
import { DataService } from './../../../../_services/data.service';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, of } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-edit-request-needs',
  templateUrl: './edit-request-needs.component.html',
  styleUrls: ['./edit-request-needs.component.css']
})
export class EditRequestNeedsComponent implements OnInit {

  changeForm: FormGroup;
  showChangeForm = false;
  showHistory;
  needsFormLoading = false;
  changeTypes;

  filteredNeedTypes: Observable<any[]>;
  needTypeFilter: Subject<string> = new Subject<string>();
  currentNeedIndex = 0;

  constructor(public dataService: DataService, public sessionData: SessionDataService,
    public dialog: MatDialog, private snackBar: MatSnackBar, private editRequestValidators: EditRequestValidators) {
    this.changeTypes = this.dataService.getMetadataFiltered('change_types', { exclude: ['new_request', 'delivery'] });
    }

  ngOnInit(): void {
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
      return (this.removeDiacritice(need_type.label).indexOf(filterValue) === 0);
    });
    if (!exactMatch) {
      list.push({ id: 0, label: label});
    }
    return list;
  }

  public needsAutocompleteDisplay(needType) {
    return needType && needType.label ? needType.label : '';
  }

  public needTypeSelected($event) {
    const ctrl = (<FormArray>this.changeForm.get('needs')).controls[this.currentNeedIndex].get('need_type');
    if ($event.option.value.id === 0) {
      this.dataService.storeMetadataType({ metadata_type: 'need_types', label: $event.option.value.label })
        .subscribe(serverResponse => {
        if (serverResponse['success']) {
          const newMetadataItem = serverResponse['data']['new_item'];
          ctrl.setValue(newMetadataItem);
          this.needTypeFilter.next('');
          this.dataService.addMetadata(serverResponse['data']['metadata_type'], newMetadataItem);
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Am adăugat "' + newMetadataItem.label + '" la tipuri de nevoi' },
            panelClass: 'snackbar-success'
          });
        } else {
          alert(serverResponse['error']);
        }
      });
    }
  }

  initForm() {
    this.changeForm = new FormGroup({
      'help_request_id': new FormControl(this.sessionData.currentRequestId, [
        Validators.required,
        Validators.min(1)
      ]),
      'change_type_id': new FormControl(null, [
        Validators.required,
        Validators.min(1)
      ]),
      'user_comment': new FormControl(),
      'needs': new FormArray([])
    }, { validators: this.editRequestValidators.EditNeedsValidator });
  }

  onUpdateNeeds() {
    this.initForm();
    this.showChangeForm = true;
  }

  onRemoveNeed(action, i) {
    this.getAsFormArray('needs').removeAt(i);
  }

  onAddNeed(action) {

    const f = new FormGroup({
      need_type: new FormControl(null, [this.editRequestValidators.NeedTypeValidator]),
      quantity: new FormControl(null, Validators.required),
      action: new FormControl(action)
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

  setCurrentNeed(index) {
    this.currentNeedIndex = index;
  }

  onSubmit() {

    Object.keys(this.changeForm.controls).forEach(field => {
      const control = this.changeForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });

    if (this.changeForm.valid) {
      // tslint:disable-next-line:prefer-const
      let data = this.changeForm.value;
      data.needs.forEach(need => {
        need.quantity = parseInt(need.quantity, 10);
        if (need.action === 'subtract') {
          need.quantity = -1 * need.quantity;
        }
        delete need.action;

        need.need_type_id = need.need_type.id;
        delete need.need_type;
      });

      this.needsFormLoading = true;
      this.dataService.storeRequestChange(data).subscribe(serverResponse => {
        this.needsFormLoading = false;
        if (serverResponse['success']) {
          this.sessionData.currentRequest = serverResponse['reloadHelpRequest'];
          this.changeForm.reset();
          this.showChangeForm = false;
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Nevoile au fost actualizate.' },
            panelClass: 'snackbar-success'
          });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['error'] },
            panelClass: 'snackbar-error',
            duration: 5000
          });
        }
      }, error => {
        this.needsFormLoading = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error.message },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      });
    } else {

    }
  }

  getAsFormArray(key: string) {
    return <FormArray>this.changeForm.get(key);
  }

}
