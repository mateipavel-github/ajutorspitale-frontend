import { RequestSentDialogComponent } from './../../_shared/request-sent-dialog/request-sent-dialog';
import { AppConstants } from './../../app-constants';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { switchMap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css']
})
export class NewRequestComponent implements OnInit {

  mode: BehaviorSubject<string> = new BehaviorSubject('newRequest');
  dataLoaded = false;
  editForm: FormGroup;
  AppConstants;
  formLoading = false;

  constructor(public dataService: DataService,
    public sessionData: SessionDataService, private route: ActivatedRoute, public dialog: MatDialog) {

    this.AppConstants = AppConstants;

    this.route.paramMap.pipe(switchMap((params) => {
      if (params.get('id')) {
        this.sessionData.currentRequestId = params.get('id');
        return dataService.getRequest(params.get('id'));
      } else {
        this.mode.next('newRequest');
        this.dataLoaded = true;

        if ('dummyData' in environment && environment['dummyData']) {
          this.sessionData.currentRequest = environment['dummyData']['request'];
          this.sessionData.currentRequestId = 1;
        }

        return new Subject();
      }
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentRequest = serverResponse['data'];
      this.mode.next('updateRequest');
    });

    this.mode.subscribe(mode => {
      switch (mode) {
        case 'newRequest':

          break;
        case 'updateRequest':
          this.editForm.clearValidators();
          this.editForm.get('needs_text').setValidators([Validators.required]);
          break;
      }
    });
  }

  public onSaveRequest() {

    Object.keys(this.editForm.controls).forEach(field => {
      const control = this.editForm.get(field);
      control.markAsTouched({ onlySelf: true });
    });

    if (this.editForm.valid) {
      let apiObservable;
      if (this.mode.value === 'newRequest') {
        apiObservable = this.dataService.storeRequest(this.editForm.value);
      } else {
        const data = {
          'needs_text': this.editForm.get('needs_text').value,
          'extra_info': this.editForm.get('extra_info').value
        };
        apiObservable = this.dataService.updateRequest(this.sessionData.currentRequestId, data);
      }

      this.formLoading = true;
      apiObservable.subscribe(serverResponse => {
        this.formLoading = false;
        switch (serverResponse.success) {
          case true:
            this.showSuccessDialog();
            this.editForm.reset();
            break;
          case false:
            alert(serverResponse.error);
            break;
        }
      });
    } else {

    }
  }

  public initSessionData() {
    this.sessionData.currentRequestId = 0;
    this.sessionData.currentRequest = {
      'name': '',
      'job_title': '',
      'phone_number': '',
      'medical_unit_name': '',
      'medical_unit_id': 0,
      'medical_unit_type_id': 0,
      'extra_info': '',
      'needs_text': ''
    };
  }

  ngOnInit(): void {
    this.editForm = new FormGroup({
      id: new FormControl(),
      name: new FormControl(null, [Validators.required]),
      phone_number: new FormControl(null, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      job_title: new FormControl(null, [Validators.required]),
      medical_unit_name: new FormControl(null, [Validators.required]),
      medical_unit_id: new FormControl(),
      medical_unit_type_id: new FormControl(null, [Validators.required]),
      county_id: new FormControl(null, [Validators.required]),
      extra_info: new FormControl(),
      needs_text: new FormControl(null, [Validators.required])
    });

    if (this.sessionData.currentRequest) {
      this.editForm.setValue({ ...this.sessionData.currentRequest, ...{ id: this.sessionData.currentRequestId } });
    }

    const driftChat = window['driftt'] = window['drift'] = window['driftt'] || [];
    if (driftChat) {
      console.log(driftChat);
    }
  }

  public showSuccessDialog() {
    const dialogRef = this.dialog.open(RequestSentDialogComponent);
  }

}
