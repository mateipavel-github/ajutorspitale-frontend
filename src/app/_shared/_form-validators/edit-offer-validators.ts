import { DataService } from '../../_services/data.service';
import { ValidatorFn, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class EditOfferValidators {

    constructor(private dataService: DataService) {

    }

    EditNeedsValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const needs = <FormArray>form.get('needs');
        return needs.length > 0 ? null : { 'needs_missing': true };
    }

    NeedTypeValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
        if ( control.value === null || typeof (control.value) === 'string' ||
            (typeof (control.value) === 'object' && control.value?.id === 0 ) ) {
            return { 'invalid': true };
        }
        return null;
    }

    // use can add needs but they are not added to the db (id will be 0)
    NeedTypeSoftValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
        if (control.value === null || typeof (control.value) === 'string' ||
            (typeof (control.value) === 'object' && !control.value?.label)) {
            return { 'invalid': true };
        }
        return null;
    }

    EditDataValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const medical_unit = form.get('medical_unit');
        const counties_list = form.get('counties_list');
        const formErrors = {};

        medical_unit.setErrors(null);

        if (this.medicalUnitSelected(medical_unit)) {
            if (counties_list.value.indexOf(medical_unit.value?.county_id) === -1) {
                medical_unit.setErrors({ 'mismatch_county': true });
                counties_list.setErrors({ 'mismatch_hospital': true });
                formErrors['medical_unit_county_mismatch'] = true;
            }
        } else {
            if (typeof (medical_unit.value) === 'string' && medical_unit.value.length !== 0) {
                    medical_unit.setErrors({ 'has_value_but_not_selected': true });
                    formErrors['medical_unit_missing'] = true;
            }
        }

        return Object.keys(formErrors).length > 0 ? formErrors : null;
    }

    EditMedicalUnitValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
        if (typeof (control.value) === 'string' && control.value.length !== 0) {
            return { 'has_value_but_not_selected': true };
        }
        return null;
    }

    medicalUnitSelected(control) {
        return (typeof (control.value) === 'object' && control.value !== null && control.value?.id > 0);
    }
}
