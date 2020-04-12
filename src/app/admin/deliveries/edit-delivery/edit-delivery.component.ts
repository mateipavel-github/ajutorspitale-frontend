import { ActivatedRoute } from '@angular/router';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { EditDeliveryValidators } from './../../../_shared/_form-validators/edit-delivery-validators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { RequestsFilterService } from './../../requests/list-requests/filter-form/requests-filter-service';
import { AppConstants } from 'src/app/app-constants';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, empty } from 'rxjs';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { switchMap, debounceTime } from 'rxjs/operators';
import { validateAllFormFields, sanitizeNeeds } from 'src/app/_helpers/form.helper';
import { NeedsEditorComponent } from 'src/app/_shared/needs-editor/needs-editor.component';

@Component({
  selector: 'app-edit-delivery',
  templateUrl: './edit-delivery.component.html',
  styleUrls: ['./edit-delivery.component.css'],
  providers: [RequestsFilterService]
})
export class EditDeliveryComponent implements OnInit, AfterViewInit {

  editForm: FormGroup;
  matchingRequests = [];
  matchingRequestsLoading = false;
  selectedRequests = [];
  formLoading = false;
  dataLoaded = false;
  AppConstants;
  editMode = 'new';
  statusChanging: boolean;
  paging = { current: 1, last: 1, total: 0, per_page: 100 };

  constructor(public dataService: DataService, private requestsFilterService: RequestsFilterService,
    private snackBar: MatSnackBar, private deliveryValidators: EditDeliveryValidators, public sessionData: SessionDataService,
    private route: ActivatedRoute) {

    this.AppConstants = AppConstants;
    this.editForm = new FormGroup({
      'medical_unit': new FormControl(),
      'name': new FormControl(null, [Validators.required]),
      'phone_number': new FormControl(null, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
      'address': new FormControl(null, [Validators.required]),
      'description': new FormControl(null),
      'county_id': new FormControl(null, [Validators.required]),
      'needs': new FormControl([]),
      'requests': new FormControl([]),
      'main_sponsor': new FormControl(),
      'delivery_sponsor': new FormControl()
    }, deliveryValidators.NewDeliveryValidator);

    this.editForm.get('medical_unit').valueChanges.subscribe(value => {
      if (value?.address) {
        this.editForm.get('address').setValue(value.address);
      }
    });

    this.requestsFilterService.filtersObservable$.pipe(
      debounceTime(300),
      switchMap(filters => {
        if (filters['needs']) {
          this.paging = { current: 1, last: 1, total: 0, per_page: 100 };
          return this.loadMatchingRequests(filters);
        } else {
          return empty();
        }
      })
    ).subscribe(this.onRequestsLoaded.bind(this), this.onRequestsError.bind(this));

    this.route.paramMap.pipe(switchMap((params) => {
      this.sessionData.currentDeliveryId = params.get('id');
      if (parseInt(params.get('id'), 10) > 0) {
        this.editMode = 'update';
        return dataService.getDelivery(params.get('id'));
      } else {
        this.dataLoaded = true;
        return empty();
      }
    })).subscribe(sr => {

      this.dataLoaded = true;
      this.sessionData.currentDelivery = sr;
      this.setSelectedRequests(sr['requests']);
      this.editForm.get('address').setValue(sr['destination_address']);
      this.editForm.get('description').setValue(sr['description']);
      this.editForm.get('county_id').setValue(sr['county_id']);
      this.editForm.get('name').setValue(sr['contact_name']);
      this.editForm.get('phone_number').setValue(sr['contact_phone_number']);
      this.editForm.get('medical_unit').setValue(sr['medical_unit']);
      this.editForm.get('main_sponsor').setValue(sr['main_sponsor']);
      this.editForm.get('delivery_sponsor').setValue(sr['delivery_sponsor']);
      /* IMPORTANT
       * needs are not set because they are set in the template.
       * I could not manage to get ViewChild / NeedsEditor access in this class
       */

    });

  }

  ngAfterViewInit(): void {
  }

  onUpdateNeeds(needs) {
    this.editForm.get('needs').setValue(needs);
    this.requestsFilterService.setFilter('needs', needs, true);
  }

  getSelectedRequests() {
    return this.editForm.get('requests').value;
  }

  setSelectedRequests(requests) {
    this.editForm.get('requests').setValue(requests);
  }

  onSelectRequest(request) {
    if (this.getSelectedRequests().indexOf(request) === -1) {
      this.getSelectedRequests().push(request);
    }
    this.setDeliveryDataFromRequest(request);
  }

  onRemoveSelectedRequest(request) {
    const index = this.getSelectedRequests().indexOf(request);
    this.getSelectedRequests().splice(index, 1);
    this.setSelectedRequests(this.getSelectedRequests());
  }

  getRelevantNeedTypes() {
    const needTypes = [];
    this.editForm.get('needs').value.forEach(need => {
      needTypes.push(need?.need_type_id || need?.need_type?.id);
    });
    return needTypes;
  }

  setDeliveryDataFromRequest(request) {
    this.editForm.get('county_id').setValue(request.county_id);
    this.editForm.get('name').setValue(request.name);
    this.editForm.get('phone_number').setValue(request.phone_number);
    if (request?.medical_unit) {
      this.editForm.get('medical_unit').setValue(request?.medical_unit);
    }
    this.editForm.get('address').setValue(request?.medical_unit?.address || request.medical_unit_name);
  }

  onPageChange(page) {
    this.loadMatchingRequests(this.requestsFilterService.getFilters(), page['pageIndex'] + 1)
      .subscribe(this.onRequestsLoaded.bind(this),
        this.onRequestsError.bind(this));
  }

  loadMatchingRequests(filters, page?) {
    this.matchingRequestsLoading = true;
    return this.dataService.getRequests({ ...filters, ...{ per_page: this.paging.per_page, page: page ? page : this.paging.current } });
  }

  onRequestsLoaded(serverResponse) {
    this.matchingRequestsLoading = false;
    this.matchingRequests = serverResponse['data']['items'];
    this.paging.current = serverResponse['data']['current_page'];
    this.paging.last = serverResponse['data']['last_page'];
    this.paging.total = serverResponse['data']['total'];
  }

  onRequestsError(serverError) {

    this.snackBar.openFromComponent(SnackbarComponent, {
      data: { message: serverError['error'] },
      panelClass: 'snackbar-error',
      duration: 5000
    });
  }

  onSave() {

    validateAllFormFields(this.editForm);

    if (this.editForm.valid) {
      this.formLoading = true;
      const extraData = {
        medical_unit_id: this.editForm.value.medical_unit?.id || 0
      };
      const serverData = { ...this.editForm.value, ...extraData };
      serverData.needs = sanitizeNeeds(serverData.needs);
      // tslint:disable-next-line:max-line-length
      let serverCall;

      if (this.editMode === 'update') {
        serverCall = this.dataService.updateDelivery(this.sessionData.currentDeliveryId, serverData);
      } else {
        serverCall = this.dataService.storeDelivery(serverData);
      }

      serverCall.subscribe(serverResponse => {
        this.formLoading = false;
        if (serverResponse['success']) {
          this.sessionData.currentDelivery = serverResponse['data']['item'];
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Livrarea a fost ' + (this.editMode === 'new' ? 'creată' : 'actualizată') },
            panelClass: 'snackbar-success'
          });
          if (this.editMode === 'new') {
            this.editMode = 'update';
            this.sessionData.currentDeliveryId = serverResponse['data']['item']['id'];
          }
        } else {

          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['error'] },
            panelClass: 'snackbar-error',
            duration: 5000
          });
        }
      }, error => {

        this.formLoading = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error?.message },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      });
    } else {

    }
  }

  onChangeStatus(status) {
    this.statusChanging = true;
    this.dataService.changeDeliveryStatus(this.sessionData.currentDeliveryId, status).subscribe(serverResponse => {
      this.statusChanging = false;
      if (serverResponse['success']) {
        this.sessionData.currentDelivery.status = status;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Statusul a fost schimbat.' },
          panelClass: 'snackbar-success'
        });
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: serverResponse['success'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      }
    });
  }

  setMainSponsor(sponsor) {
    this.editForm.get('main_sponsor').setValue(sponsor);
  }
  setDeliverySponsor(sponsor) {
    this.editForm.get('delivery_sponsor').setValue(sponsor);
  }

  ngOnInit(): void {
  }

}
