export const AppConstants = {
    // phone_number_pattern: '(004|\\+4)?0([0-9]{9,10})',
    phone_number_pattern: '[0-9]{9,10}',
    _phone_number_error: 'Format: doar cifre, fără spații, fără prefixul țării ',

    get phone_number_error() {
        return this._phone_number_error;
    },
    set phone_number_error(value) {
        this._phone_number_error = value;
    },
};

