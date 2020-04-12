import { DataService } from '../../_services/data.service';
import { ValidatorFn, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class EditDeliveryValidators {

    constructor(private dataService: DataService) {

    }

    NewDeliveryValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const requests = form.get('requests');
        const medical_unit = form.get('medical_unit');
        const county = form.get('county_id');
        const formErrors = {};

        county.setErrors(null);
        medical_unit.setErrors(null);

        if (requests.value.length >= 1) {
            const firstRequest = requests.value[0];
            requests.value.forEach( (r, i) => {
                if (r.phone_number !== firstRequest.phone_number) {
                    requests.setErrors({ 'multiple_people': true });
                    formErrors['requests_from_different_people'] = true;
                }
                if (r.county_id !== firstRequest.county_id) {
                    requests.setErrors({ 'multiple_counties': true });
                    formErrors['requests_from_different_counties'] = true;
                }
            });

            if (medical_unit.value && medical_unit.value?.county_id !== firstRequest.county_id) {
                medical_unit.setErrors({ 'medical_unit_county_mismatch_requests': true });
            }
        }

        const deliveryCounty = county.value;
        if (deliveryCounty) {
            if (medical_unit.value && medical_unit.value?.county_id && medical_unit.value?.county_id !== deliveryCounty) {
                county.setErrors({ 'mismatch_with_medical_unit': true });
            }
            if (requests.value.length > 0 && requests.value[0].county_id !== deliveryCounty) {
                county.setErrors({ 'mismatch_with_requests': true });
            }
        }

        return Object.keys(formErrors).length > 0 ? formErrors : null;
    }

}
