import { FormGroup, FormControl } from '@angular/forms';

export const validateAllFormFields = function (formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
            control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {
            validateAllFormFields(control);
        }
    });
};

export const sanitizeNeeds = function (needs) {
    return needs.map(need => {
        if (need?.need_type) {
            need.need_type_id = need.need_type?.id || 0;
            delete need.need_type;
        }
        return need;
    });
};


