import { EditRequestComponent } from './../../requests/edit-request/edit-request.component';
import { MultiDragDropComponent } from './../../../_shared/multi-drag-drop/multi-drag-drop.component';
import { element } from 'protractor';
import { SessionDataService } from 'src/app/_services/session-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataService } from 'src/app/_services/data.service';
import { RequestsFilterService } from './../../requests/list-requests/filter-form/requests-filter-service';
import { Component, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { switchMap } from 'rxjs/operators';
import { empty, Subject, ReplaySubject, Observable, BehaviorSubject } from 'rxjs';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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
  searchResultsLoaded = false;
  saving = false;

  deliveryNeeds$ = new BehaviorSubject<[]>([]);
  componentsReady$: ReplaySubject<any> = new ReplaySubject();

  currentTab = 'search';

  @ViewChild('filterForm') filterForm: RequestsFilterFormComponent;
  @ViewChild('deliveryNeedsEditor') deliveryNeedsEditor: NeedsEditorComponent;

  @ViewChild('planList') planList: MultiDragDropComponent;
  @ViewChild('searchList') searchList: MultiDragDropComponent;

  protected relevantNeedTypes = [];

  protected searchRequestsList = [];
  protected searchSummary = { needs: [] };

  protected planRequestsList = [];
  protected planSummary = { count: 0, needs: [] };

  protected editForm: FormGroup;

  constructor(public dialog: MatDialog, private requestsFilterService: RequestsFilterService, private dataService: DataService,
    private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router, public sessionData: SessionDataService) {

    
    // initialize request search filters
    this.requestsFilterService.init();
    this.requestsFilterService.items$.subscribe(list => {
      this.searchResultsLoaded = true;
      this.searchRequestsList = list;
    });

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
        if (this.deliveryNeedsEditor) {
          this.deliveryNeedsEditor.setNeeds(needs);
        }
        this.setPlanDetails('needs', needs);
        this.requestsFilterService.setFilter('needs', needs, true);
        this.relevantNeedTypes = this.getRelevantNeedTypes(needs);
        this.setDeliveryNeedsSorting();
      });

      // create new delivery plan
      this.route.paramMap.pipe(switchMap((params) => {
        if (params.get('plan_id') === 'new') {
          // tslint:disable-next-line:max-line-length
          this.dataService.createDeliveryPlan(params.get('order_id') ? { fromOffer: params.get('offer_id') } : {}).subscribe(serverResponse => {
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
        this.editForm.get('title').setValue(this.sessionData.currentDeliveryPlan.title);

        this.deliveryNeeds$.next(this.getDeliveryNeeds());

        // set requests
        this.planRequestsList = [];

        const sortedList = serverResponse['data']['requests'].sort(function (a, b) {
          return a.pivot.position - b.pivot.position;
        });

        sortedList.forEach(r => {
          r.priority_group = r.pivot.priority_group;
          r.details = r.pivot.details;
        });

        this.prepareForSorting(sortedList);

        this.planRequestsList = sortedList;
        this.updatePlanRequestsTotals();

        // set offers @todo

      });

      this.componentsReady$.next();

    }, 0);
  }

  toggleEditInline(r, i?) {
    Object.assign(r, { editInline: !r?.editInline });
  }

  setRequestDeliveryQuantity($event, r, needTypeId) {
    const q = $event.target.value;
    const needIndex = _.findIndex(r.details.need_deliveries, (n, i) => n['need_type_id'] === needTypeId);
    if (needIndex !== -1) {
      r.details.need_deliveries[needIndex]['quantity'] = q;
    } else {
      r.details.need_deliveries.push({ need_type_id: needTypeId, quantity: q });
    }
    this.toggleEditInline(r);
    this.savePlanRequests();
  }

  onEditRequest(r, i) {
    const dialogRef = this.dialog.open(EditRequestComponent, {
      data: { id: r.id, tab: 'needs' },
      height: '90%',
      width: '90%',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.dataService.getRequest(r.id).subscribe(sr => {
        Object.assign(r, sr['data']);
      });
    });
  }

  getRequestDeliveryQuantity(r, needTypeId) {
    let q = this.getRequestNeedQuantity(r, needTypeId);
    if (r.details?.need_deliveries) {
      r.details.need_deliveries.forEach(nd => {
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

  updatePlanRequestsTotals(): void {
    const t = {
      'count': this.planRequestsList.length,
      'needs': new Map
    };
    this.planRequestsList.forEach(r => {
      if (r?.current_needs) {
        r.current_needs.forEach(n => {
          const needTypeId = n?.need_type?.id || n?.need_type_id;
          if (!t.needs.has(needTypeId)) {
            t.needs.set(needTypeId, 0);
          }
          t.needs.set(needTypeId, t.needs.get(needTypeId) + n.quantity);
        });
      }
    });
    this.planSummary.count = t.count;
    this.planSummary.needs = [];
    t.needs.forEach((n, k) => {
      this.planSummary.needs.push({ need_type_id: k, quantity: n });
    });
  }

  public setPlanDetails(key, value) {
    this.editForm.get('details').value[key] = value;
  }

  public savePlanDetails(key, value) {
    this.setPlanDetails(key, value);
    this.onSave();
  }

  public savePlanRequests() {
    this.editForm.get('requests').setValue(this.planRequestsList.map((r, p) => {
      return { id: r.id, priority_group: r?.priority || 0, position: p, details: r?.details || {} };
    }));
    this.onSave();
  }

  public onSave() {
    
    this.dataService.updateDeliveryPlan(this.sessionData.currentDeliveryPlanId, this.editForm.value)
      .subscribe(serverResponse => {
        if (serverResponse['success']) {

          this.sessionData.currentDeliveryPlan = serverResponse['data']['item'];
          this.deliveryNeeds$.next(this.getDeliveryNeeds());

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
    this.requestsFilterService.setFilter('needs', needs, true);
    this.savePlanDetails('needs', needs);
  }

  onAddToPlan() {

    const toAdd = [];
    this.searchRequestsList.forEach((sr, i) => {
      if (this.searchList.isSelected(i) && !this.planRequestsList.find(pr => pr.id === sr.id)) {
        toAdd.push(sr);
      }
    });
    this.prepareForSorting(toAdd);
    Array.prototype.push.apply(this.planRequestsList, toAdd);
    this.updatePlanRequestsTotals();
    this.savePlanRequests();
  }

  itemsRemoved(ev, list) {
    this.savePlanRequests();
  }

  itemsAdded(ev, list) {
    this.savePlanRequests();
  }

  itemsUpdated(ev, list) {
    console.log('itemsupdated');
    this.savePlanRequests();
  }

  selectionChanged(ev, list) {

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
   * create need_deliveries based on DeliveryNeeds$.value for each request
   * edit delivery data/needs in popup
   * fix sorting by need quantity
   */

  prepareForSorting(list) {
    list.forEach(r => {
      r.priority_group = r?.priority_group || 100;
      r.county_size = r?.county_size || this.dataService.getCountyById(r.county_id)?.sort_order;
      r.medical_unit_type_size = r?.medical_unit_type_size || this.dataService.getMedicalUnitTypeById(r.medical_unit_type_id)?.sort_order;
      r.current_needs.forEach(n => {
        r['sort_need_' + n.need_type_id] = n.quantity;
      });
      if (!('details' in r) || !('need_deliveries' in r?.details)) {
        r.details = {
          'need_deliveries': []
        };
      }
    });
  }

  sortPlan($event) {
    console.log($event);
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

  ngOnInit(): void {
  }

  onTabChange($event) {
    switch ($event.index) {
      case 0:
        this.currentTab = 'search';
        this.componentsReady$.subscribe(() => {
          // this.filterForm.setFilter('needs', this.deliveryNeeds);
        });
        break;
      case 1:
        this.currentTab = 'plan';

        break;
    }
  }

}
