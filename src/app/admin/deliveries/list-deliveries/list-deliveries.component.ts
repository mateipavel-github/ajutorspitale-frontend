import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/_services/data.service';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-list-deliveries',
  templateUrl: './list-deliveries.component.html',
  styleUrls: ['./list-deliveries.component.css']
})
export class ListDeliveriesComponent implements OnInit {

  deliveriesLoaded = false;
  deliveries;
  filters = { flag: 'all' };

  constructor(private dataService: DataService, private route: ActivatedRoute) {

    this.route.paramMap.pipe(switchMap((params) => {
      this.deliveriesLoaded = false;
      this.filters['flag'] = params.get('filter');
      return this.dataService.getDeliveries(this.filters);
    })).subscribe(serverResponse => {
      this.deliveriesLoaded = true;
      this.deliveries = serverResponse['data'];
    });

  }

  ngOnInit(): void {
  }

}
