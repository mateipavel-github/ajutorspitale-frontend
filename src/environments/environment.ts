// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  appName: 'AjutorSpitale.ro',
  production: false,
  api: {
    url: 'http://ajutorspitale.local/api/v1',
    auth_url: 'http://ajutorspitale.local/oauth/token',
    client_id: 1,
    client_secret: 'eFV7fPzFEEY8QtdQXiRuIycouZqFgKYmRS0yPPoe'
  },
  dummyData: {
    request: {
      'name': 'Doctor Popescu',
      'job_title': 'Șef secție ATI',
      'phone_number': '0722278567',
      'medical_unit_name': 'Spitalul de urgență',
      'county_id': 5,
      'medical_unit_type_id': 4,
      'medical_unit_id': 0,
      'needs_text': '100 x apă plată 5l\n1000 măști FPP3',
      'extra_info': 'extra info cerere'
    },
    offer: {
      'name': 'Doctor Popescu',
      'job_title': 'Șef secție ATI',
      'phone_number': '0722278567',
      'organization_name': 'Carpatina',
      'medical_unit_name': 'Spitalul de urgență',
      'medical_unit_id': null,
      'county_ids': [1, 2],
      'needs_text': '',
      'needs': [
        { need_type: { id: 10, label: 'test' } , quantity: 30 },
        { need_type: { id: 0, label: 'Nevoie nouă' }, quantity: 40}
      ],
      'extra_info': 'extra info ofertă'
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
