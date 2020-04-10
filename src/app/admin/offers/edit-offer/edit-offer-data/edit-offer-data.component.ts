import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/_services/data.service';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { EditOfferValidators } from 'src/app/_shared/_form-validators/edit-offer-validators';
import { AppConstants } from 'src/app/app-constants';
import { validateAllFormFields } from 'src/app/_helpers/form.helper';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';

@Component({
  selector: 'app-edit-offer-data',
  templateUrl: './edit-offer-data.component.html',
  styleUrls: ['./edit-offer-data.component.css']
})
export class EditOfferDataComponent implements OnInit {

  editForm: FormGroup;
  formLoading = false;
  changeTypes;
  AppConstants;

  constructor(public dataService: DataService, public sessionData: SessionDataService,
    private snackBar: MatSnackBar, private editOfferValidators: EditOfferValidators) {

    console.log('ABCD');
    
    this.AppConstants = AppConstants;
    this.changeTypes = this.dataService.getMetadataFiltered('change_types', { exclude: ['new_request', 'delivery'] });
  }

  public initForm() {
    this.editForm = new FormGroup({
      name: new FormControl(this.sessionData.currentOffer['name'], [Validators.required]),
      // tslint:disable-next-line:max-line-length
      phone_number: new FormControl(this.sessionData.currentOffer['phone_number'], [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      job_title: new FormControl(this.sessionData.currentOffer['job_title']),
      medical_unit_name: new FormControl(this.sessionData.currentOffer['medical_unit_name'], [Validators.required]),
      medical_unit: new FormControl(this.sessionData.currentOffer['medical_unit'], [this.editOfferValidators.EditMedicalUnitValidator]),
      medical_unit_type_id: new FormControl(this.sessionData.currentOffer['medical_unit_type_id']),
      county_id: new FormControl(this.sessionData.currentOffer['county_id'], [Validators.required]),
      extra_info: new FormControl(this.sessionData.currentOffer['extra_info']),
      change_data: new FormGroup({
        change_type_id: new FormControl(null, [Validators.required]),
        user_comment: new FormControl(null)
      })
    }, { validators: this.editOfferValidators.EditDataValidator });
  }

  ngOnInit(): void {
    this.initForm();
  }

  public onChangeMedicalUnit($event) {
    // console.log('Form value: ', this.editForm.get('medical_unit').value);
    // console.log('Event: ', $event);
  }

  public onSubmit() {

    validateAllFormFields(this.editForm);

    if (this.editForm.valid) {
      this.formLoading = true;
      const extraData = {
        medical_unit_id: this.editForm.value.medical_unit?.id || 0
      };
      // tslint:disable-next-line:max-line-length
      this.dataService.updateOffer(this.sessionData.currentOfferId, { ...this.editForm.value, ...extraData }).subscribe(serverResponse => {
        this.formLoading = false;
        if (serverResponse['success']) {
          this.sessionData.currentOffer = serverResponse['data']['item'];
          this.editForm.get('change_data.user_comment').reset();
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Cererea a fost actualizată' },
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
        this.formLoading = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error.message },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      });
    } else {

    }
  }

}
