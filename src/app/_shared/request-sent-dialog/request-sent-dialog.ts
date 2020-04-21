import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-request-sent-dialog',
  templateUrl: './request-sent-dialog.component.html',
  styleUrls: ['./request-sent-dialog.component.css']
})
export class RequestSentDialogComponent implements OnInit {

  title;
  p1;
  p2;

  constructor(
    public dialogRef: MatDialogRef<RequestSentDialogComponent>,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any) {

        this.title = data?.title;
        this.p1 = data?.p1;
        this.p2 = data?.p2;

    }

  ngOnInit(): void {
  }

  public onClose() {
    this.dialogRef.close();
  }

}
