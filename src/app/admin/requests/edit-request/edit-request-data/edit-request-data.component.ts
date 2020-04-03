import { SnackbarComponent } from './../../../../_shared/snackbar/snackbar.component';
import { AppConstants } from './../../../../app-constants';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SessionDataService } from './../../../../_services/session-data.service';
import { DataService } from './../../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { EditMedicalUnitValidator } from 'src/app/_shared/_form-validators/edit-request-validators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-request-data',
  templateUrl: './edit-request-data.component.html',
  styleUrls: ['./edit-request-data.component.css']
})
export class EditRequestDataComponent implements OnInit {

  editForm: FormGroup;
  formLoading = false;
  AppConstants;

  constructor(public dataService: DataService, public sessionData: SessionDataService, private snackBar: MatSnackBar) {
    this.AppConstants = AppConstants;
  }

  public initForm() {
    this.editForm = new FormGroup({
      name: new FormControl(this.sessionData.currentRequest['name'], [Validators.required]),
      // tslint:disable-next-line:max-line-length
      phone_number: new FormControl(this.sessionData.currentRequest['phone_number'], [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      job_title: new FormControl(this.sessionData.currentRequest['job_title'], [Validators.required]),
      medical_unit_name: new FormControl(this.sessionData.currentRequest['medical_unit_name'], [Validators.required]),
      medical_unit: new FormControl(this.sessionData.currentRequest['medical_unit'], [EditMedicalUnitValidator]),
      medical_unit_type_id: new FormControl(this.sessionData.currentRequest['medical_unit_type_id'], [Validators.required]),
      county_id: new FormControl(this.sessionData.currentRequest['county_id'], [Validators.required]),
      extra_info: new FormControl(this.sessionData.currentRequest['extra_info']),

      help_request_id: new FormControl(this.sessionData.currentRequestId, [Validators.required, Validators.min(1)]),
      change_type_id: new FormControl(null, [Validators.required]),
      user_comment: new FormControl(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  public onChangeMedicalUnit($event) {
    // console.log('Form value: ', this.editForm.get('medical_unit').value);
    // console.log('Event: ', $event);
  }

  public onSubmit() {

    Object.keys(this.editForm.controls).forEach(field => {
      const control = this.editForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });

    if (this.editForm.valid) {
      this.formLoading = true;
      const extraData = {
        medical_unit_id: this.editForm.value.medical_unit?.id || 0
      };
      this.dataService.storeRequestChange({ ...this.editForm.value, ...extraData }).subscribe(serverResponse => {
        this.formLoading = false;
        if (serverResponse['success']) {
          this.sessionData.currentRequest = serverResponse['reloadHelpRequest'];
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Cererea a fost actualizată' },
            panelClass: 'snackbar-success'
          });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['error'] },
            panelClass: 'snackbar-error'
          });
        }
      });
    } else {

    }
  }

}
