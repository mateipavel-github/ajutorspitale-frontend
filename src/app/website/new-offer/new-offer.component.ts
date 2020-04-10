import { validateAllFormFields } from './../../_helpers/form.helper';
import { NeedsEditorComponent } from './../../_shared/needs-editor/needs-editor.component';
import { RequestSentDialogComponent } from './../../_shared/request-sent-dialog/request-sent-dialog';
import { AppConstants } from './../../app-constants';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { switchMap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.component.html',
  styleUrls: ['./new-offer.component.css']
})
export class NewOfferComponent implements OnInit, AfterViewInit {

  mode: BehaviorSubject<string> = new BehaviorSubject('new');
  dataLoaded = false;
  editForm: FormGroup;
  AppConstants;
  formLoading = false;

  @ViewChild(NeedsEditorComponent)
  private needsEditor: NeedsEditorComponent;

  constructor(public dataService: DataService,
    public sessionData: SessionDataService, private route: ActivatedRoute, public dialog: MatDialog) {

    this.AppConstants = AppConstants;

    this.route.paramMap.pipe(switchMap((params) => {
      if (params.get('id')) {
        this.sessionData.currentOfferId = params.get('id');
        // return dataService.getOffer(params.get('id'));
      } else {
        this.mode.next('new');
        this.dataLoaded = true;

        if ('dummyData' in environment && environment['dummyData']) {
          this.sessionData.currentOffer = environment['dummyData']['offer'];
          this.sessionData.currentOfferId = 1;
        }

        return new Subject();
      }
    })).subscribe(serverResponse => {
      this.dataLoaded = true;
      this.sessionData.currentOffer = serverResponse['data'];
      this.mode.next('update');
    });

    this.mode.subscribe(mode => {
      switch (mode) {
        case 'new':

          break;
        case 'update':
          this.editForm.clearValidators();
          // this.editForm.get('other_needs').setValidators([Validators.required]);
          break;
      }
    });
  }

  public onSave() {

    validateAllFormFields(this.editForm);

    if (this.editForm.valid) {
      let apiObservable;
      if (this.mode.value === 'new') {
        apiObservable = this.dataService.storeOffer(this.editForm.value);
      } else {
        const data = {
          'help_offer_id': this.sessionData.currentOfferId,
          'extra_info': this.editForm.get('extra_info').value
        };
        apiObservable = this.dataService.updateOffer(this.sessionData.currentOfferId, data);
      }

      this.formLoading = true;
      apiObservable.subscribe(serverResponse => {
        this.formLoading = false;
        switch (serverResponse.success) {
          case true:
            this.showSuccessDialog();
            this.needsEditor.clearNeeds();
            this.editForm.reset();
            break;
          case false:
            alert(serverResponse.error);
            break;
        }
      });
    } else {
      console.log(this.editForm.errors);
    }
  }

  public initSessionData() {
    this.sessionData.currentOfferId = 0;
    this.sessionData.currentOffer = {
      'name': '',
      'job_title': '',
      'phone_number': '',
      'medical_unit_name': '',
      'organization_name': '',
      'counties_list': [],
      'medical_unit_id': 0,
      'extra_info': '',
      'needs_text': '',
      'needs': []
    };
  }

  ngOnInit(): void {
    this.editForm = new FormGroup({
      id: new FormControl(),
      name: new FormControl(null, [Validators.required]),
      phone_number: new FormControl(null, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      job_title: new FormControl(null, [Validators.required]),
      organization_name: new FormControl(null),
      medical_unit_name: new FormControl(null),
      medical_unit_id: new FormControl(),
      counties_list: new FormControl(null, [Validators.required]),
      extra_info: new FormControl(null, [Validators.required]),
      needs_text: new FormControl(null),
      needs: new FormArray([])
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.sessionData.currentOffer) {
        const data = { ...this.sessionData.currentOffer, ...{ id: this.sessionData.currentOfferId } };
        const needs = data.needs.slice();
        data.needs.splice(0, data.needs.length);
        this.editForm.setValue(data);
        if (needs.length > 0) {
          this.needsEditor.setNeeds(needs);
        }
      }
    }, 0);
  }

  public showSuccessDialog() {
    const dialogRef = this.dialog.open(RequestSentDialogComponent, {
      data: {
        title: 'Soluția a fost trimisă',
        // tslint:disable-next-line:max-line-length
        p1: 'Dacă există (sau apare) o nevoie pentru produsele sau serviciile oferite de tine, voluntarii de la AjutorSpitale te vor contacta telefonic.',
        p2: 'Îți mulțumim!'
      }
    });
  }

  public onNeedsUpdated(needs) {

    this.editForm.get('needs_text').setValue('');

    const needsArray = <FormArray>this.editForm.get('needs');
    needsArray.controls.splice(0, needsArray.length);
    needs.forEach(need => {
      if (need.need_type?.id > 0) {
        const f = new FormGroup({
          'need_type_id': new FormControl(need.need_type?.id ? need.need_type?.id : null),
          'quantity': new FormControl(need.quantity)
        });
        needsArray.push(f);
      } else {
        this.editForm.get('needs_text').setValue(
          this.editForm.get('needs_text').value + '\n' + need.quantity + ' x ' + need.need_type?.label
        );
      }
    });
  }

}
