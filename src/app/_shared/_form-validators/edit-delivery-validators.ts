import { DataService } from '../../_services/data.service';
import { ValidatorFn, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class EditDeliveryValidators {

    constructor(private dataService: DataService) {

    }

    NewDeliveryValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const medical_unit = form.get('medical_unit');
        const county = form.get('county_id');
        const formErrors = {};

        county.setErrors(null);
        medical_unit.setErrors(null);

        const deliveryCounty = county.value;
        if (deliveryCounty) {
            if (medical_unit.value && medical_unit.value?.county_id && medical_unit.value?.county_id !== deliveryCounty) {
                county.setErrors({ 'mismatch_with_medical_unit': true });
            }
        }

        return Object.keys(formErrors).length > 0 ? formErrors : null;
    }

}
