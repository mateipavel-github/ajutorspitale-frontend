import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {

  reports = [
    {
      name: 'Toate nevoile procesate',
      description: 'Fiecare linie din export conține o nevoie și cantitatea ei, unitatea medicală și persoana care a trimis cererea.',
      url: '/stats/requests-to-csv'
    }
  ];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  onDownload(report) {
    report.loading = true;
    this.dataService.downloadCSV(report.url).subscribe( (data: any) => {
      report.loading = false;
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
      const d = new Date();
      const element = document.createElement('a');
      element.href = URL.createObjectURL(blob);
      element.download = report.name + ' ' + d.getDay() + '-' + d.getMonth() + '-'
        + d.getFullYear() + '-' + d.getHours() + '-' + d.getMinutes() + '.csv';
      document.body.appendChild(element);
      element.click();
    }, error => {
        report.loading = false;
        alert(error);
    });
  }


}
