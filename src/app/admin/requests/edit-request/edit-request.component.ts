import { SessionDataService } from './../../../_services/session-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from './../../../_services/data.service';
import { Component, OnInit } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormControl, FormArray } from '@angular/forms';

@Component({
  selector: 'app-edit-request',
  templateUrl: './edit-request.component.html',
  styleUrls: ['./edit-request.component.css']
})
export class EditRequestComponent implements OnInit {

  dataLoaded = false;
  showNeedsText = true;

  constructor(public dataService: DataService, public sessionData: SessionDataService, private route: ActivatedRoute) {

    this.route.paramMap.pipe(switchMap((params) => {
      this.sessionData.currentRequestId = params.get('id');
      return dataService.getRequest(params.get('id'));
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentRequest = serverResponse['data'];
      this.showNeedsText = !(this.sessionData.currentRequest.needs && this.sessionData.currentRequest.needs.length > 0);
    });

  }

  ngOnInit(): void {
  }

}
