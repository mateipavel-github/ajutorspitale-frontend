// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
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
      'extra_info': 'power to the people'
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
