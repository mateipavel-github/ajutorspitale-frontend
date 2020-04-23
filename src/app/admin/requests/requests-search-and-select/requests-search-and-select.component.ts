import { DataService } from 'src/app/_services/data.service';
import { RequestsFilterService } from './../list-requests/filter-form/requests-filter-service';
import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { RequestsFilterFormComponent } from '../list-requests/filter-form/filter-form.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MultiDragDropComponent } from 'src/app/_shared/multi-drag-drop/multi-drag-drop.component';
import * as _ from 'lodash';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-requests-search-and-select',
  templateUrl: './requests-search-and-select.component.html',
  styleUrls: ['./requests-search-and-select.component.css'],
  providers: [RequestsFilterService]
})
export class RequestsSearchAndSelectComponent implements OnInit, AfterViewInit {


  @ViewChild('filterForm') filterForm: RequestsFilterFormComponent;
  @ViewChild('searchList') searchList: MultiDragDropComponent;

  save_label = 'Adaugă cererile selectate';
  cancel_label = 'Anulează';


  searchResultsLoaded = true;
  public searchRequestsList = [];
  public searchSummary = { needs: [] };

  componentsReady$: ReplaySubject<any> = new ReplaySubject();

  protected relevantNeedTypes = [];

  constructor(private dataService: DataService, private requestsFilterService: RequestsFilterService,
    public dialogRef: MatDialogRef<RequestsSearchAndSelectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    console.log('Open search with data: ', data);

    this.requestsFilterService.setItemsPerPage(data?.per_page || 1000);
    this.requestsFilterService.setFilters({
      status: data?.filters?.status || [],
      needs: data?.filters?.needs || [],
      exclude_ids: data?.filters?.exclude_ids || null
    });

    this.requestsFilterService.init();
    this.requestsFilterService.loading$.subscribe(loading => this.searchResultsLoaded = !loading);
    this.requestsFilterService.items$.subscribe(list => {
      this.searchRequestsList = list;
    });

    this.requestsFilterService.filtersObservable$.subscribe(filters => {
      if (filters?.needs) {
        this.setRelevantNeedTypes(filters?.needs);
      }
    });

  }

  selectAll($event) {
    $event.stopPropagation();
    this.searchList.selectAll();
  }
  selectNone($event) {
    $event.stopPropagation();
    this.searchList.clearSelection();
  }

  setRelevantNeedTypes(needs) {
    const relevantTypes = [];
    if (needs) {
      needs.forEach(need => {
        relevantTypes.push(need?.need_type_id || need?.need_type?.id);
      });
    }
    this.relevantNeedTypes = relevantTypes;
  }

  onDismiss(flag) {
    if (flag) {
      this.dialogRef.close(_.at(this.searchRequestsList, this.searchList.selections));
    } else {
      this.dialogRef.close(null);
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.componentsReady$.next();
  }

  getLabel(type, id) {
    return this.dataService.getMetadataLabel(type, id);
  }

  itemsRemoved(ev, list) { }
  selectionChanged(ev, list) { }
  itemsAdded(ev, list) { }
  itemsUpdated(ev, list) { }

}
