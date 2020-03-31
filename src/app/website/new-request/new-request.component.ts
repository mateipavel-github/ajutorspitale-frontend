import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-new-request',
  templateUrl: './new-request.component.html',
  styleUrls: ['./new-request.component.css']
})
export class NewRequestComponent implements OnInit {

  mode = 'newRequest';
  dataLoaded = false;
  editForm: FormGroup;

  constructor(public dataService: DataService, public sessionData: SessionDataService, private route: ActivatedRoute) {
    this.route.paramMap.pipe(switchMap((params) => {
      if (params.get('id')) {
        this.sessionData.currentRequestId = params.get('id');
        return dataService.getRequest(params.get('id'));
      } else {
        this.mode = 'newRequest';
        if (!params.get('id')) {
          this.dataLoaded = true;
        }
        this.initForm();
        return new Subject();
      }
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentRequest = serverResponse['data'];
      this.mode = 'updateRequest';
      this.initForm();
    });
  }

  public onSaveRequest() {

    let apiObservable;
    if (this.mode === 'newRequest') {
      apiObservable = this.dataService.storeRequest(this.editForm.value);
    } else {
      const data = {
        'help_request_id': this.sessionData.currentRequestId,
        'needs_text': this.editForm.get('needs_text').value,
        'extra_info': this.editForm.get('extra_info').value
      };
      apiObservable = this.dataService.storeRequestChange(data);
    }

    apiObservable.subscribe(serverResponse => {
      switch (serverResponse.success) {
        case 'true':
          this.editForm.reset();
          break;
        case 'false':
          alert(serverResponse.error);
          break;
      }
    });
  }

  public initForm() {
    if (this.mode === 'updateRequest') {
      this.editForm.setValue({
        extra_info: this.sessionData.currentRequest['extra_info'],
        needs_text: this.sessionData.currentRequest['needs_text']
      });
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
      name: new FormControl(),
      phone_number: new FormControl(),
      job_title: new FormControl(),
      medical_unit_name: new FormControl(),
      medical_unit_id: new FormControl(),
      medical_unit_type_id: new FormControl(),
      extra_info: new FormControl(),
      needs_text: new FormControl()
    });
  }

}
