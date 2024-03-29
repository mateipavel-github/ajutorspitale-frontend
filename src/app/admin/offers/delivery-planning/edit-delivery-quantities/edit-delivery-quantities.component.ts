import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { AppConstants } from 'src/app/app-constants';
import { EditDeliveryValidators } from 'src/app/_shared/_form-validators/edit-delivery-validators';

@Component({
  selector: 'app-edit-delivery-quantities',
  templateUrl: './edit-delivery-quantities.component.html',
  styleUrls: ['./edit-delivery-quantities.component.css']
})
export class EditDeliveryQuantitiesComponent implements OnInit {

  counties: [];
  editForm: FormGroup;
  AppConstants;

  constructor(public dataService: DataService, public dialogRef: MatDialogRef<EditDeliveryQuantitiesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private deliveryValidators: EditDeliveryValidators) {

    this.counties = dataService.metadata['counties'];
    console.log(data);
    this.AppConstants = AppConstants;
    this.editForm = new FormGroup({
      'id': new FormControl(data.delivery?.id || null),
      'medical_unit': new FormControl(data.delivery?.medical_unit),
      'destination_contact_name': new FormControl(data.delivery?.destination_contact_name, [Validators.required]),
      // tslint:disable-next-line:max-line-length
      'destination_phone_number': new FormControl(data.delivery?.destination_phone_number, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      'destination_address': new FormControl(data.delivery?.destination_address, [Validators.required]),
      'description': new FormControl(data.delivery?.description),
      'destination_county_id': new FormControl(data.delivery?.destination_county_id, [Validators.required]),
      'destination_city_name': new FormControl(data.delivery?.destination_city_name, [Validators.required]),
      'packages': new FormControl(data.delivery?.packages),
      'size': new FormControl(data.delivery?.size),
      'weight': new FormControl(data.delivery?.weight),
      'needs': new FormArray([])
      // 'main_sponsor': new FormControl(data.delivery?.main_sponsor),
      // 'delivery_sponsor': new FormControl(data.delivery?.delivery_sponsor)
    }, deliveryValidators.NewDeliveryValidator);

    this.data.delivery.needs.forEach( n => {
      const f = new FormGroup({
        need_type_id: new FormControl(n.need_type_id),
        quantity: new FormControl(n.quantity),
        delivery_quantity: new FormControl(n.delivery_quantity)
      });

      this.getAsFormArray('needs').push(f);
    });

  }

  onMedicalUnitSelect(value) {
    this.editForm.get('destination_address').setValue(value.address);
  }

  getLabel(id) {
    return this.dataService.getMetadataLabel('need_types', id);
  }

  getAsFormArray(key) {
    return <FormArray>this.editForm.get(key);
  }

  onSave() {
    this.dialogRef.close(this.editForm.value);
  }

  onDismiss() {
    this.dialogRef.close(null);
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
