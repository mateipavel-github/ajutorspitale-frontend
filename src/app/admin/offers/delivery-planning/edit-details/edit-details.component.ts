import { Component, OnInit, Inject } from '@angular/core';
import { DataService } from 'src/app/_services/data.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditDeliveryQuantitiesComponent } from '../edit-delivery-quantities/edit-delivery-quantities.component';
import { EditDeliveryValidators } from 'src/app/_shared/_form-validators/edit-delivery-validators';
import { AppConstants } from 'src/app/app-constants';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.css']
})
export class EditDetailsComponent implements OnInit {

  counties: [];
  AppConstants;
  editForm: FormGroup;

  constructor(public dataService: DataService, public dialogRef: MatDialogRef<EditDeliveryQuantitiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.counties = dataService.metadata['counties'];

    this.AppConstants = AppConstants;
    this.editForm = new FormGroup({
      'sender': new FormGroup({
        'sender_name': new FormControl(data.delivery?.sender_name, [Validators.required]),
        'sender_contact_name': new FormControl(data.delivery?.sender_contact_name, [Validators.required]),
        // tslint:disable-next-line:max-line-length
        'sender_phone_number': new FormControl(data.delivery?.sender_phone_number, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
        'sender_address': new FormControl(data.delivery?.sender_address, [Validators.required]),
        'description': new FormControl(data.delivery?.description),
        'sender_county_id': new FormControl(data.delivery?.sender_county_id, [Validators.required]),
        'sender_city_name': new FormControl(data.delivery?.sender_city_name, [Validators.required])
      }),
      'main_sponsor': new FormControl(data.delivery?.main_sponsor),
      'delivery_sponsor': new FormControl(data.delivery?.delivery_sponsor)
    });

  }

  onDismiss() {
    this.dialogRef.close(null);
  }

  onSave() {
    this.dialogRef.close(this.editForm.value);
  }

  setMainSponsor(sponsor) {
    this.editForm.get('main_sponsor').setValue(sponsor);
  }
  setDeliverySponsor(sponsor) {
    this.editForm.get('delivery_sponsor').setValue(sponsor);
  }

  ngOnInit(): void {
  }

}
