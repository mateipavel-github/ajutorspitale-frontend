import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

import { switchMap } from 'rxjs/operators';
import { forkJoin, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  metadata;

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
    return this.api.get(environment.apiUrl + '/metadata');
  }

  public getRequests() {
    return this.api.get(environment.apiUrl + '/requests');
  }

  public getMetadataLabel($type, $id) {
    for (let i = 0; i < this.metadata[$type].length; i++) {
      if (this.metadata[$type]['id'] === $id) {
        return this.metadata[$type]['id'];
      }
    }
      return '<metadata not found>';

  }

}
