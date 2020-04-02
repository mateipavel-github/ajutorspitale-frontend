import { FormGroup, FormControl } from '@angular/forms';
import { SessionDataService } from './../../../../_services/session-data.service';
import { DataService } from './../../../../_services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-request-data',
  templateUrl: './edit-request-data.component.html',
  styleUrls: ['./edit-request-data.component.css']
})
export class EditRequestDataComponent implements OnInit {

  editForm: FormGroup;
  formLoading = false;

  constructor(public dataService: DataService, public sessionData: SessionDataService) {

  }

  public initForm() {
    this.editForm = new FormGroup({
      name: new FormControl(this.sessionData.currentRequest['name']),
      phone_number: new FormControl(this.sessionData.currentRequest['phone_number']),
      job_title: new FormControl(this.sessionData.currentRequest['job_title']),
      medical_unit_name: new FormControl(this.sessionData.currentRequest['medical_unit_name']),
      medical_unit_id: new FormControl(this.sessionData.currentRequest['medical_unit_id']),
      medical_unit_type_id: new FormControl(this.sessionData.currentRequest['medical_unit_type_id']),
      extra_info: new FormControl(this.sessionData.currentRequest['extra_info']),

      help_request_id: new FormControl(this.sessionData.currentRequestId),
      change_type_id: new FormControl(),
      user_comment: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  public onSubmit() {
    this.formLoading = true;
    this.dataService.storeRequestChange(this.editForm.value).subscribe(serverResponse => {
      this.formLoading = false;
      if (serverResponse['success']) {
        this.sessionData.currentRequest = serverResponse['reloadHelpRequest'];
      } else {
        alert(serverResponse['error']);
      }
    });
  }

}
