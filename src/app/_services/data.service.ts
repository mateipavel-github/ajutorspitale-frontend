import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

import { forkJoin, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  metadata;
  authError = false;

  constructor(private api: HttpClient) {
  }

  public bootstrap() {

    const done = new Subject();

    forkJoin([this.getMetadata()]).subscribe(serverResponses => {
      this.metadata = serverResponses[0];
      done.next(true);
    });

    return done;

  }

  public getDeliveries(params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/deliveries', { params: queryParams });
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
  public removeMetadataItem(type, id) {
    return this.api.post(environment.api.url + '/metadata', { 'metadata_type': type, 'id': id, '_method': 'DELETE' });
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
  public getMetadataSlug(type, id) {
    id = parseInt(id, 10);
    for (let i = 0; i < this.metadata[type].length; i++) {
      if (this.metadata[type][i]['id'] === id) {
        return this.metadata[type][i]['slug'];
      }
    }
    return null;
  }

}
