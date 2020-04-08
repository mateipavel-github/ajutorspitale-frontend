import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionDataService {

  currentRequestId;
  currentRequest;

  currentOfferId;
  currentOffer;

  constructor() { }
}
