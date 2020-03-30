import { SessionDataService } from './../../../../_services/session-data.service';
import { DataService } from './../../../../_services/data.service';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-request-needs',
  templateUrl: './edit-request-needs.component.html',
  styleUrls: ['./edit-request-needs.component.css']
})
export class EditRequestNeedsComponent implements OnInit {

  changeForm: FormGroup;
  showChangeForm = false;

  constructor(public dataService: DataService, public sessionData: SessionDataService) {}

  ngOnInit(): void { }

  initForm() {
    this.changeForm = new FormGroup({
      'help_request_id': new FormControl(this.sessionData.currentRequestId),
      'change_type_id': new FormControl(),
      'user_comment': new FormControl(),
      'needs_to_add': new FormArray([]),
      'needs_to_subtract': new FormArray([])
    });
  }

  onUpdateNeeds() {
    this.initForm();
    this.showChangeForm = true;
  }

  onAddNeed(type) {

    const f = new FormGroup({
      need_type_id: new FormControl(),
      quantity: new FormControl()
    });

    switch (type) {
      case 'add':
        this.getAsFormArray('needs_to_add').push(f);
        break;
      case 'substract':
        this.getAsFormArray('needs_to_subtract').push(f);
        break;
    }
  }

  onSubmit() {
    // tslint:disable-next-line:prefer-const
    let data = this.changeForm.value;
    data.needs = [];
    data.needs_to_add.forEach(need => {
      need.quantity = parseInt(need.quantity, 10);
      data.needs.push(need);
    });
    data.needs_to_subtract.forEach(need => {
      need.quantity = -1 * need.quantity;
      data.needs.push(need);
    });
    delete data.needs_to_add;
    delete data.needs_to_subtract;
    this.dataService.storeRequestChange(data).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.sessionData.currentRequest = serverResponse['reloadHelpRequest'];
      }
    });
  }

  getAsFormArray(key: string) {
    return <FormArray>this.changeForm.get(key);
  }

}
