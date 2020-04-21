import { RequestsSearchAndSelectComponent } from './../../requests/requests-search-and-select/requests-search-and-select.component';
// tslint:disable-next-line:max-line-length
import { EditDeliveryQuantitiesComponent } from './../delivery-planning/edit-delivery-quantities/edit-delivery-quantities.component';
import { EditRequestComponent } from './../../requests/edit-request/edit-request.component';
import { MultiDragDropComponent } from './../../../_shared/multi-drag-drop/multi-drag-drop.component';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/_services/data.service';
import { RequestsFilterService } from './../../requests/list-requests/filter-form/requests-filter-service';
import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { switchMap } from 'rxjs/operators';
import { empty, Subject, ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import { FormGroup, FormControl } from '@angular/forms';
import { RequestsFilterFormComponent } from '../../requests/list-requests/filter-form/filter-form.component';
import { NeedsEditorComponent } from 'src/app/_shared/needs-editor/needs-editor.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-delivery-planning',
  templateUrl: './delivery-planning.component.html',
  styleUrls: ['./delivery-planning.component.css'],
  providers: [RequestsFilterService]
})

export class DeliveryPlanningComponent implements OnInit, AfterViewInit {

  planLoaded = false;

  deliveryNeeds$ = new BehaviorSubject<[]>([]);
  componentsReady$: ReplaySubject<any> = new ReplaySubject();

  @ViewChild('deliveryNeedsEditor') deliveryNeedsEditor: NeedsEditorComponent;
  @ViewChild('planList') planList: MultiDragDropComponent;

  protected relevantNeedTypes = [];

  protected planRequestsList = [];
  protected planSummary = { count: 0, needs: [] };
  protected planSummarySelected = { count: 0, needs: [] };

  protected editForm: FormGroup;
  planDirty = false;
  planIsSaving = false;

  constructor(public dialog: MatDialog, private dataService: DataService,
    private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, public sessionData: SessionDataService) {

    // initialize form
    this.editForm = new FormGroup({
      title: new FormControl(''),
      requests: new FormControl([]),
      offers: new FormControl([]),
      details: new FormControl({}) // includes needs
    });

  }

  ngAfterViewInit(): void {
    setTimeout(() => {

      //
      this.deliveryNeeds$.subscribe(needs => {
        this.setPlanDetails('needs', needs);
        this.relevantNeedTypes = this.getRelevantNeedTypes(needs);
        this.setDeliveryNeedsSorting();
        this.prepareList(this.planRequestsList);
      });

      // create new delivery plan
      this.route.paramMap.pipe(switchMap((params) => {
        if (params.get('plan_id') === 'new') {
          // tslint:disable-next-line:max-line-length
          this.dataService.createDeliveryPlan(params.get('offer_id') ? { fromOffer: params.get('offer_id') } : {}).subscribe(serverResponse => {
            this.router.navigate(['/admin', 'delivery-plan', serverResponse['data']['id']]);
          });
          return empty();
        } else {
          return this.dataService.loadDeliveryPlan(params.get('plan_id'));
        }
      })).subscribe(serverResponse => {
        this.planLoaded = true;
        this.sessionData.currentDeliveryPlanId = serverResponse['data']['id'];
        this.sessionData.currentDeliveryPlan = serverResponse['data'];

        // set title
        this.setPlanTitle(this.sessionData.currentDeliveryPlan.title);

        this.deliveryNeeds$.next(this.getDeliveryNeeds());

        this.componentsReady$.subscribe(() => {
          if (this.deliveryNeedsEditor) {
            this.deliveryNeedsEditor.setNeeds(this.deliveryNeeds$.value);
          }
        });

        // set requests
        this.planRequestsList = [];

        const sortedList = serverResponse['data']['requests'].sort(function (a, b) {
          return a.pivot.position - b.pivot.position;
        });

        sortedList.forEach(r => {
          r.priority_group = r.pivot.priority_group;
          r.details = r.pivot.details;
        });

        this.prepareList(sortedList);

        this.planRequestsList = sortedList;
        this.updatePlanSummary();
        this.setPlanRequests();

        // set offers @todo

      });

      this.componentsReady$.next();

    }, 0);
  }

  onEditRequest($event, r, i) {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(EditRequestComponent, {
      data: { id: r.id, tab: 'needs' },
      height: '90%',
      width: '90%',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.dataService.getRequest(r.id).subscribe(sr => {
        this.prepareOne(sr['data']);
        Object.assign(r, sr['data']);
      });
    });
    this.updatePlanSummary();
  }

  onEditRequestDelivery($event, r, i) {
    $event.stopPropagation();
    const dialogRef = this.dialog.open(EditDeliveryQuantitiesComponent, {
      data: r,
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        Object.assign(r.delivery, result);
        this.updatePlanSummary();
        this.setPlanRequests();
      }
    });
  }

  getRequestDeliveryQuantity(r, needTypeId) {
    let q = this.getRequestNeedQuantity(r, needTypeId);
    if (r.delivery?.needs) {
      r.delivery.needs.forEach(nd => {
        if (nd.need_type_id === needTypeId) {
          q = nd.quantity;
        }
      });
    }
    return q;
  }

  getRequestNeedQuantity(r, needTypeId) {
    let q = 0;
    r.current_needs.forEach(cn => {
      if (cn.need_type_id === needTypeId) {
        q = cn.quantity;
      }
    });
    return q;
  }

  updatePlanSummary(onlySelected = false): void {
    const t = {
      'count': 0,
      'needs': new Map<number, {quantity: 0, delivery_quantity: 0}>()
    };

    // const list = onlySelected ? _.at(this.planRequestsList, this.planList.selections) : this.planRequestsList;
    const summary = onlySelected ? this.planSummarySelected : this.planSummary;

    this.planRequestsList.forEach((r, i) => {
      if (!onlySelected || this.planList.isSelected(i)) {
        t.count++;
        if (r?.delivery.needs) {
          r.delivery.needs.forEach(n => {
            const needTypeId = n.need_type_id;
            if (!t.needs.has(needTypeId)) {
              t.needs.set(needTypeId, { quantity: 0, delivery_quantity: 0 });
            }
            t.needs.set(needTypeId, {
              quantity: t.needs.get(needTypeId).quantity + n.quantity,
              // tslint:disable-next-line:max-line-length
              delivery_quantity: t.needs.get(needTypeId).delivery_quantity + (n.delivery_quantity === 'max' ? n.quantity : parseInt(n.delivery_quantity, 10))
            });
          });
        }
      }
    });
    summary.count = t.count;
    summary.needs = [];
    t.needs.forEach((n, k) => {
      summary.needs.push({ need_type_id: k, quantity: n.quantity, delivery_quantity: n.delivery_quantity });
    });
  }

  public setPlanDetails(key, value) {
    this.editForm.get('details').value[key] = value;
    this.markPlanDirty();
  }
  public setPlanRequests() {
    this.editForm.get('requests').setValue(this.planRequestsList.map((r, p) => {
      return { id: r.id, priority_group: r?.priority || 0, position: p, details: r?.details || {} };
    }));
    this.markPlanDirty();
  }
  public setPlanTitle(title) {
    this.editForm.get('title').setValue(title);
    this.markPlanDirty();
  }

  public onSave() {

    this.planIsSaving = true;
    this.dataService.updateDeliveryPlan(this.sessionData.currentDeliveryPlanId, this.editForm.value)
      .subscribe(serverResponse => {
        this.planIsSaving = false;
        if (serverResponse['success']) {
          this.markPlanClean();
          this.sessionData.currentDeliveryPlan = serverResponse['data']['item'];
          this.deliveryNeeds$.next(this.getDeliveryNeeds());
          this.componentsReady$.subscribe(() => {
            if (this.deliveryNeedsEditor) {
              this.deliveryNeedsEditor.setNeeds(this.deliveryNeeds$.value);
            }
          });

          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Planul a fost salvat' },
            panelClass: 'snackbar-success',
            duration: 2000
          });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['message'] },
            panelClass: 'snackbar-error',
            duration: 5000
          });
        }
      }, error => {

        this.planIsSaving = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error['message'] },
          panelClass: 'snackbar-error',
          duration: 5000
        });
      });
  }

  /* */

  // triggered by NeedsEditorComponent
  deliveryNeedsUpdated(needs) {
    this.deliveryNeeds$.next(needs);
  }

  onRemoveFromPlan() {
    _.pullAt(this.planRequestsList, this.planList.selections);
    this.updatePlanSummary();
    this.setPlanRequests();
  }

  onAddToPlan(list) {
    const toAdd = [];
    list.forEach((sr, i) => {
      if (this.planRequestsList.find(pr => pr.id === sr.id) === undefined) {
        toAdd.push(sr);
      }
    });
    this.prepareList(toAdd);
    Array.prototype.push.apply(this.planRequestsList, toAdd);
    this.planList.render();
    this.updatePlanSummary();
    this.setPlanRequests();
  }

  itemsRemoved(ev, list) {
    this.setPlanRequests();
  }

  itemsAdded(ev, list) {
    this.setPlanRequests();
  }

  itemsUpdated(ev, list) {
    this.setPlanRequests();
  }

  selectionChanged(ev, list) {
    this.updatePlanSummary(true);
  }

  selectAll($event) {
    $event.stopPropagation();
    this.planList.selectAll();
  }
  selectNone($event) {
    $event.stopPropagation();
    this.planList.clearSelection();
  }

  // tslint:disable-next-line:member-ordering
  sortControl: FormControl = new FormControl([]);
  // tslint:disable-next-line:member-ordering
  sortOptions = [
    { position: 0, key: 'priority_group', direction: 'asc', label: 'Prioritate', f: o => o.priority_group },
    { position: 0, key: 'priority_group', direction: 'desc', label: 'Prioritate', f: o => o.priority_group },
    { position: 0, key: 'county_size', direction: 'asc', label: 'Populație județ', f: o => o.county_size },
    { position: 0, key: 'county_size', direction: 'desc', label: 'Populație județ', f: o => o.county_size },
    { position: 0, key: 'county_name', direction: 'asc', label: 'Nume județ', f: o => o.county_name },
    { position: 0, key: 'county_name', direction: 'desc', label: 'Nume județ', f: o => o.county_name },
    // tslint:disable-next-line:max-line-length
    { position: 0, key: 'medical_unit_type_size', direction: 'asc', label: 'Dimensiune unitate medicală', f: o => o?.medical_unit_type_size || 0 },
    // tslint:disable-next-line:max-line-length
    { position: 0, key: 'medical_unit_type_size', direction: 'desc', label: 'Dimensiune unitate medicală', f: o => o?.medical_unit_type_size || 0 },
    { position: 0, key: 'id', direction: 'asc', label: 'ID', f: o => o.id },
    { position: 0, key: 'id', direction: 'desc', label: 'ID', f: o => o.id },
  ];
  // tslint:disable-next-line:member-ordering
  sortBy = [];

  setDeliveryNeedsSorting() {
    _.remove(this.sortOptions, so => {
      return so.key.indexOf('sort_') === 0;
    });
    this.relevantNeedTypes.forEach(needTypeId => {
      const sortKey = 'sort_need_' + needTypeId;
      // tslint:disable-next-line:max-line-length
      this.sortOptions.push({ position: 0, key: sortKey, direction: 'asc', label: this.dataService.getMetadataLabel('need_types', needTypeId), f: o => o[sortKey] || 0 });
      // tslint:disable-next-line:max-line-length
      this.sortOptions.push({ position: 0, key: sortKey, direction: 'desc', label: this.dataService.getMetadataLabel('need_types', needTypeId), f: o => o[sortKey] || 0 });
    });
  }

  /*
   * TODO
   * create delivery.needs based on DeliveryNeeds$.value for each request
   * edit delivery data/needs in popup
   * fix sorting by need quantity
   */

  prepareOne(r) {
    r.priority_group = r?.priority_group || 100;
    r.county_size = r?.county_size || this.dataService.getCountyById(r.county_id)?.sort_order;
    r.medical_unit_type_size = r?.medical_unit_type_size || this.dataService.getMedicalUnitTypeById(r.medical_unit_type_id)?.sort_order;
    r.current_needs.forEach(n => {
      r['sort_need_' + n.need_type_id] = n.quantity;
    });

    if (!('delivery' in r) || !r?.delivery) {
      r.delivery = {};
    }

    if (!('contact_name' in r.delivery)) {
      r.delivery.contact_name = r.name;
      r.delivery.contact_phone_number = r.phone_number;
      r.delivery.county_id = r.county_id;
      r.delivery.main_sponsor = {id: 1, name: '--Main sponsor--'}; // get default sponsor
      r.delivery.delivery_sponsor = { id: 2, name: '--Main delivery--'}; // get delivery sponsor
      r.delivery.address = r?.medical_unit?.address || null;
      r.delivery.medical_unit = r?.medical_unit || null;
    }

    if (!('needs' in r?.delivery)) {
      r.delivery.needs = [];
    }

    this.deliveryNeeds$.value.forEach(dn => {
      const deliveryNeedIndex = _.findIndex(r.delivery.needs, n => n['need_type_id'] === dn['need_type_id']);
      const currentNeed = _.find(r.current_needs, n => n['need_type_id'] === dn['need_type_id']);
      if (deliveryNeedIndex === -1) {
        // tslint:disable-next-line:max-line-length
        r.delivery.needs.push({ need_type_id: dn['need_type_id'], quantity: currentNeed?.quantity || 0, delivery_quantity: 'max' });
      } else {
        if (currentNeed !== undefined) {
          r.delivery.needs[deliveryNeedIndex].quantity = currentNeed.quantity;
        }
      }
    });

  }

  prepareList(list) {
    list.forEach(r => {
      this.prepareOne(r);
    });
  }

  markPlanDirty() {
    this.planDirty = true;
  }
  markPlanClean() {
    this.planDirty = false;
  }

  sortPlan($event) {
    const iteratees = [];
    const orders = [];
    this.sortBy.forEach(so => {
      iteratees.push(so.f);
      orders.push(so.direction);
    });
    this.planRequestsList = _.orderBy(this.planRequestsList, iteratees, orders);
    this.sortOptions.forEach(so => {
      so.position = 0;
    });
    this.sortControl.setValue([]);
    this.markPlanDirty();
  }

  onSortChange($event) {
    $event.value.forEach(so => {
      if (!this.sortBy.find(v => so.key === v.key && so.direction === v.direction)) {
        this.sortBy.push(so);
      }
    });
    const toRemove = [];
    this.sortBy.forEach((so, i) => {
      if (!$event.value.find(v => so.key === v.key && so.direction === v.direction)) {
        toRemove.push(i);
      }
    });
    toRemove.forEach(i => {
      this.sortBy.splice(i, 1);
    });
    this.sortOptions.forEach(so => {
      so.position = 0;
    });
    this.sortBy.forEach((so, i) => {
      this.sortOptions.find(v => so.key === v.key && so.direction === v.direction).position = i + 1;
    });
  }

  setPriorityGroup(group) {
    this.planRequestsList.forEach((r, index) => {
      if (this.planList.isSelected(index)) {
        r.priority_group = group;
      }
    });
    this.setPlanRequests();
  }

  getRelevantNeedTypes(needs) {
    const relevantTypes = [];
    if (needs) {
      needs.forEach(need => {
        relevantTypes.push(need?.need_type_id || need?.need_type?.id);
      });
    }
    return relevantTypes;
  }

  getDeliveryNeeds() {
    return this.sessionData.currentDeliveryPlan.details?.needs || [];
  }

  getLabel(type, id) {
    return this.dataService.getMetadataLabel(type, id);
  }

  onOpenSearchDialog($event) {

    const dialogRef = this.dialog.open(RequestsSearchAndSelectComponent, {
      data: {
        'per_page': 10000,
        'filters': {'needs': this.deliveryNeeds$.value, 'status': ['approved', 'processed']}
      },
      height: '90%',
      width: '99%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Selected requests: ', result);
      if (result) {
        this.onAddToPlan(result);
      }
    });
  }

  ngOnInit(): void {
  }

}
