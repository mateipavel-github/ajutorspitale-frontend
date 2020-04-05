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

  public getMetadata() {
    return this.api.get(environment.api.url + '/metadata');
  }

  public getDeliveries(params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/deliveries', { params: queryParams });
  }

  public getRequests(params?) {
    let queryParams = new HttpParams();
    const paramKeys = Object.getOwnPropertyNames(params);
    paramKeys.forEach(key => {
      queryParams = queryParams.set(key, params[key]);
    });
    return this.api.get(environment.api.url + '/requests', { params: queryParams });
  }

  public getRequest(id) {
    return this.api.get(environment.api.url + '/requests/' + id);
  }

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
    const data = { '_method':  'DELETE' };
    return this.api.post(environment.api.url + '/users/' + id, data);
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

  public getMedicalUnits(filterString, countyId?) {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('filter', filterString);
    if (countyId) {
      queryParams = queryParams.set('county_id', countyId);
    }
    return this.api.get(environment.api.url + '/metadata/medical-units', { params: queryParams });
  }

  public addMetadata(type, item) {
    this.metadata[type].push(item);
  }

  public storeRequestChange(data) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/changeRequests', data);
  }

  public storeRequest(data) {
    data._method = 'PUT';
    return this.api.post(environment.api.url + '/requests', data);
  }

  public unassignCurrentUserFromRequest(requestId) {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('action', 'unassignCurrentUser');
    return this.updateRequest(requestId, {}, { params: queryParams } );
  }

  public assignCurrentUserToRequest(requestId) {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('action', 'assignCurrentUser');
    return this.updateRequest(requestId, {}, { params: queryParams });
  }

  public changeRequestStatus(requestId, status) {
    let queryParams = new HttpParams();
    queryParams = queryParams.set('action', 'changeStatus');
    return this.updateRequest(requestId, {'status': status}, { params: queryParams });
  }

  public assignCurrentUserToManyRequests(howMany) {
    const data = { 'howMany': howMany };
    return this.api.post(environment.api.url + '/requests/mass-assign-to-user', data);
  }

  public updateRequest(requestId, data, options) {
    data['_method'] = 'PATCH';
    return this.api.post(environment.api.url + '/requests/' + requestId, data, options);
  }

  public removeMetadataItem(type, id) {
    return this.api.post(environment.api.url + '/metadata', { 'metadata_type': type, 'id': id, '_method': 'DELETE' });
  }

  public saveMetadataItem(data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/metadata', data);
  }

  public getAuthToken(data: any) {
    return this.api.post(environment.api.auth_url, data);
  }

  public login(data: any) {
    return this.api.post(environment.api.url + '/user/login', data);
  }

  public storeMetadataType(data) {
    data['_method'] = 'PUT';
    return this.api.post(environment.api.url + '/metadata', data);
  }

  public storeNote(data) {
    data['_METHOD'] = 'PUT';
    return this.api.post(environment.api.url + '/request-notes', data);
  }
}
