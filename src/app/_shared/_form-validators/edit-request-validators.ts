import { ValidatorFn, FormGroup, ValidationErrors, FormArray, FormControl } from '@angular/forms';

export const EditNeedsValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const needs_to_add = <FormArray>control.get('needs_to_add');
    const needs_to_subtract = <FormArray>control.get('needs_to_subtract');

    return ((needs_to_add).length + (needs_to_subtract).length) > 0 ? null : { 'needs_missing': true };
};

export const EditMedicalUnitValidator: ValidatorFn = (control: FormControl): ValidationErrors | null => {
    if (typeof (control.value) === 'string' && control.value.length !== 0) {
        return { 'medical_unit_missing': true };
    }
    return null;
};
