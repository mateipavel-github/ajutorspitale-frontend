import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

import { forkJoin, Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  metadata;
  authError = false;
  userRolesAccessScopes$: BehaviorSubject<any> = new BehaviorSubject({});

  constructor(private api: HttpClient) {
  }

  public downloadCSV(url) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'text/csv'
      }),
      responseType: 'text' as 'json'
    };
    return this.api.get(environment.api.url + url, httpOptions);
  }
  public downloadXLS(url) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }),
      responseType: 'arraybuffer' as 'json'
    };
    return this.api.get(environment.api.url + url, httpOptions);
  }

  public bootstrap() {

    const done = new Subject();

    forkJoin([this.getMetadata()]).subscribe(serverResponses => {
      this.metadata = serverResponses[0];
      const aux = {};
      this.metadata['user_role_types'].forEach(role => {
        aux[role['slug']] = role.scopes ? role.scopes.split(',') : [];
      });
      this.userRolesAccessScopes$.next(aux);
      done.next(true);
    });

    return done;

  }

  public getMedicalUnits(filterString, countyId?) {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('filter', filterString);
    if (countyId) {
      queryParams = queryParams.set('county_id', countyId);
    }
    return this.api.get(environment.api.url + '/metadata/medical-units', { params: queryParams });
  }

  /*
   * Delivery Planning
   */

  public createDeliveryPlan(data?) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/delivery-plans', data);
  }

  public loadDeliveryPlan(id) {
    return this.api.get(environment.api.url + '/delivery-plans/' + id);
  }

  public updateDeliveryPlan(id, data) {
    data._method = 'PATCH';
    return this.api.post(environment.api.url + '/delivery-plans/' + id, data);
  }
  
  
  /*
  * Sponsor API calls
  */
  public getSponsors(params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/sponsors', { params: queryParams });
  }

  public storeSponsor(data) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/sponsors', data);
  }

  /*
   * Delivery API calls
   */
  public getDeliveries(params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/deliveries', { params: queryParams });
  }

  public addDeliveryNote(data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/deliveries/' + data.item_id + '/add-note', data);
  }

  public storeDelivery(data) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/deliveries', data);
  }

  public updateDelivery(id, data, action?) {
    const options = { params: null };
    if (action) {
      let queryParams = new HttpParams();
      queryParams = queryParams.set('action', action);
      options.params = queryParams;
    }

    data['_method'] = 'PATCH';
    return this.api.post(environment.api.url + '/deliveries/' + id, data, options);
  }

  public changeDeliveryStatus(id, status) {
    return this.updateDelivery(id, { 'status': status }, 'changeStatus');
  }

  public getDelivery(id) {
    return this.api.get(environment.api.url + '/deliveries/' + id);
  }


  /*
   * Requests API calls
   */

  // list | search requests
  public getRequests(params?) {
    return this._getPostings('requests', params);
  }
  // get details of a specific request
  public getRequest(id) {
    return this._getPosting('requests', id);
  }
  // create new request
  public storeRequest(data) {
    return this._storePosting('requests', data);
  }
  // assign current user to multiple requests
  public assignCurrentUserToManyRequests(howMany) {
    return this._assignCurrentUserToManyPostings('requests', howMany);
  }
  // add note
  public addRequestNote(data) {
    return this._addPostingNote('requests', data);
  }
  // generic update
  public updateRequest(requestId, data) {
    return this._updatePosting('requests', requestId, data);
  }
  // unassign current user from request
  public unassignCurrentUserFromRequest(requestId) {
    return this._updatePosting('requests', requestId, {}, 'unassignCurrentUser');
  }
  // assign current user to request
  public assignCurrentUserToRequest(requestId) {
    return this._updatePosting('requests', requestId, {}, 'assignCurrentUser');
  }
  // change status of request
  public changeRequestStatus(requestId, status) {
    return this._updatePosting('requests', requestId, { 'status': status }, 'changeStatus');
  }

  /*
   * Offers API calls
   */

  // list | search offers
  public getOffers(params?) {
    return this._getPostings('offers', params);
  }
  // get details of a specific request
  public getOffer(id) {
    return this._getPosting('offers', id);
  }
  // create new request
  public storeOffer(data) {
    return this._storePosting('offers', data);
  }
  // assign current user to multiple offers
  public assignCurrentUserToManyOffers(howMany) {
    return this._assignCurrentUserToManyPostings('offers', howMany);
  }
  // add note
  public addOfferNote(data) {
    return this._addPostingNote('offers', data);
  }
  // generic update
  public updateOffer(requestId, data) {
    return this._updatePosting('offers', requestId, data);
  }
  // unassign current user from request
  public unassignCurrentUserFromOffer(requestId) {
    return this._updatePosting('offers', requestId, {}, 'unassignCurrentUser');
  }
  // assign current user to request
  public assignCurrentUserToOffer(requestId) {
    return this._updatePosting('offers', requestId, {}, 'assignCurrentUser');
  }
  // change status of request
  public changeOfferStatus(requestId, status) {
    return this._updatePosting('offers', requestId, { 'status': status }, 'changeStatus');
  }

  /*
   * Postings API calls
   */

  private _assignCurrentUserToManyPostings(postingType, howMany) {
    const data = { 'howMany': howMany };
    return this.api.post(environment.api.url + '/' + postingType + '/mass-assign-to-user', data);
  }
  private _addPostingNote(postingType, data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/' + postingType + '/' + data.item_id + '/add-note', data);
  }
  private _updatePosting(postingType, postingId, data, action?) {

    const options = { params: null };
    if (action) {
      let queryParams = new HttpParams();
      queryParams = queryParams.set('action', action);
      options.params = queryParams;
    }

    data['_method'] = 'PATCH';
    return this.api.post(environment.api.url + '/' + postingType + '/' + postingId, data, options);
  }
  private _storePosting(postingType, data) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/' + postingType, data);
  }
  private _getPostings(postingType, params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/' + postingType, { params: queryParams });
  }
  private _getPosting(postingType, postingId) {
    return this.api.get(environment.api.url + '/' + postingType + '/' + postingId);
  }

  /*
   * Authentication API Calls
   */
  public login(data: any) {
    return this.api.post(environment.api.url + '/user/login', data);
  }
  public getAuthToken(data: any) {
    return this.api.post(environment.api.auth_url, data);
  }

  /*
   * Users
   */

  public getUsers() {
    return this.api.get(environment.api.url + '/users');
  }

  public saveUser(data) {
    if (data.id && data.id > 0) {
      data._method = 'PUT';
      return this.api.post(environment.api.url + '/users/' + data.id, data);
    } else {
      data._method = 'POST';
      return this.api.post(environment.api.url + '/users', data);
    }
  }

  public deleteUser(id) {
    const data = { '_method': 'DELETE' };
    return this.api.post(environment.api.url + '/users/' + id, data);
  }

  /*
   * Metadata
   */

  public getMetadata() {
    return this.api.get(environment.api.url + '/metadata');
  }
  public addMetadata(type, item) {
    this.metadata[type].push(item);
  }
  public storeMetadataType(data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/metadata', data);
  }
  public saveMetadataItem(data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/metadata', data);
  }
  public removeMetadataItem(type, id, merge_into_id) {
    return this.api.post(environment.api.url + '/metadata/' + type + '/' + id, {
      'merge_into_id': merge_into_id,
      '_method': 'DELETE'
    });
  }
  public getMetadataFiltered(metadata_type, options) {
    let filterType, slugs;
    if (options?.include) {
      filterType = 'include';
      slugs = options.include;
      return this.metadata[metadata_type].filter(item => {
        return slugs.includes(item.slug);
      });
    }
    if (options?.exclude) {
      filterType = 'exclude';
      slugs = options.exclude;
      return this.metadata[metadata_type].filter(item => {
        return !slugs.includes(item.slug);
      });
    }
    console.warn('must provide either {exclude: [slug1, slug2...]} or {include: [slug1, slug2]}');
    return this.metadata[metadata_type];
  }
  public getMetadataLabel(type, id) {
    id = parseInt(id, 10);
    for (let i = 0; i < this.metadata[type].length; i++) {
      if (this.metadata[type][i]['id'] === id) {
        return this.metadata[type][i]['label'];
      }
    }
    return '<metadata not found>';
  }

  public getMetadataLabelsCombined(type, ids) {
    const list = [];
    ids.forEach(id => {
      list.push(this.getMetadataLabel(type, id));
    });
    return list.join(', ');
  }

  public getMetadataSlug(type, id) {
    id = parseInt(id, 10);
    for (let i = 0; i < this.metadata[type].length; i++) {
      if (this.metadata[type][i]['id'] === id) {
        return this.metadata[type][i]['slug'];
      }
    }
    return null;
  }

  public getCountyById(id) {
    return this.getMetadataById('counties', id);
  }
  public getMedicalUnitTypeById(id) {
    return this.getMetadataById('medical_unit_types', id);
  }

  public getMetadataById(type, id) {
    for (let i = 0; i < this.metadata[type].length; i++) {
      if (this.metadata[type][i]['id'] === id) {
        return this.metadata[type][i];
      }
    }
    return undefined;
  }

}
