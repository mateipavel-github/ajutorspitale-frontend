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

  constructor(private dataService: DataService, private sessionData: SessionDataService) {}

  ngOnInit(): void { }

  initForm() {
    this.changeForm = new FormGroup({
      'needsToAdd': new FormArray([]),
      'needsToSubstract': new FormArray([])
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
        this.getAsFormArray('needsToAdd').push(f);
        break;
      case 'substract':
        this.getAsFormArray('needsToSubstract').push(f);
        break;
    }
  }

  getAsFormArray(key: string) {
    return <FormArray>this.changeForm.get(key);
  }

}
