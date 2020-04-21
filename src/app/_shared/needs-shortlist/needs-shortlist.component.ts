import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-needs-shortlist',
  templateUrl: './needs-shortlist.component.html',
  styleUrls: ['./needs-shortlist.component.css']
})
export class NeedsShortlistComponent implements OnInit {

  @Input() needs;
  @Input() showOnlyTypes = [];
  @Input() showDeliveryQuantities = false;

  constructor(private dataService: DataService) { }

  getLabel(needTypeId) {
    return this.dataService.getMetadataLabel('need_types', needTypeId);
  }

  shouldShow(needTypeId) {
    if (this.showOnlyTypes.length === 0) {
      return true;
    } else {
      return this.showOnlyTypes.indexOf(needTypeId) > -1;
    }
  }

  ngOnInit(): void {
  }

}
