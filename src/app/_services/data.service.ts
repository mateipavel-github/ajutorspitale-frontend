import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';

import { switchMap } from 'rxjs/operators';
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

  public getMetadataLabel(type, id) {

    for (let i = 0; i < this.metadata[type].length; i++) {
      if (this.metadata[type][i]['id'] === id) {
        return this.metadata[type][i]['label'];
      }
    }

    return '<metadata not found>';

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
}
