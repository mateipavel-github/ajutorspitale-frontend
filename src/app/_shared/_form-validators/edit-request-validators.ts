import { DataService } from './../../_services/data.service';
import { ValidatorFn, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { Injectable } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class EditRequestValidators {

    constructor(private dataService: DataService) {

    }

    EditNeedsValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const needs = <FormArray>form.get('needs');
        return needs.length > 0 ? null : { 'needs_missing': true };
    }

    NeedTypeValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
        console.log(control.value);
        if ( control.value === null || typeof (control.value) === 'string' ||
            (typeof (control.value) === 'object' && control.value?.id === 0 ) ) {
            return { 'invalid': true };
        }
        return null;
    }

    EditDataValidator: ValidatorFn = (form: FormGroup): ValidationErrors | null => {
        const medicalUnitType = form.get('medical_unit_type_id');
        const medical_unit = form.get('medical_unit');
        const county_id = form.get('county_id');
        const formErrors = {};

        medical_unit.setErrors(null);

        if (this.medicalUnitSelected(medical_unit)) {
            if (medical_unit.value?.county_id !== county_id.value) {
                medical_unit.setErrors({ 'mismatch_county': true });
                county_id.setErrors({ 'mismatch_hospital': true });
                formErrors['medical_unit_county_mismatch'] = true;
            }
        } else {
            if (this.dataService.getMetadataSlug('medical_unit_types', medicalUnitType.value).indexOf('state-hospital') === 0) {
                medical_unit.setErrors({ 'required_for_state_hospitals': true });
                formErrors['medical_unit_missing'] = true;
            } else {
                if (typeof (medical_unit.value) === 'string' && medical_unit.value.length !== 0) {
                    medical_unit.setErrors({ 'has_value_but_not_selected': true });
                    formErrors['medical_unit_missing'] = true;
                }
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
