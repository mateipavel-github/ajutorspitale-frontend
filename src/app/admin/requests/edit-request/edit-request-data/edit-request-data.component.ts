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

  constructor(private dataService: DataService, private sessionData: SessionDataService) {
    
  }

  public initForm() {
    console.log('initializing form');
    this.editForm = new FormGroup({
      name: new FormControl(this.sessionData.currentRequest['name']),
      phone_number: new FormControl(this.sessionData.currentRequest['phone_number']),
      job_title: new FormControl(this.sessionData.currentRequest['job_title']),
      medical_unit_name: new FormControl(this.sessionData.currentRequest['medical_unit_name']),
      medical_unit_id: new FormControl(this.sessionData.currentRequest['medical_unit_id']),
      medical_unit_type_id: new FormControl(this.sessionData.currentRequest['medical_unit_type_id']),
      extra_info: new FormControl(this.sessionData.currentRequest['extra_info'])
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

}
