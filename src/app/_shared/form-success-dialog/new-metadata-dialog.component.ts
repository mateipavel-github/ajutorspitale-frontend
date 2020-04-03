import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from 'src/app/_services/data.service';

@Component({
  selector: 'app-new-metadata-dialog',
  templateUrl: './new-metadata-dialog.component.html',
  styleUrls: ['./new-metadata-dialog.component.css']
})
export class NewMetadataDialogComponent implements OnInit {

  metadata_type;
  newMetadataTypeLabel;

  constructor(
    public dialogRef: MatDialogRef<NewMetadataDialogComponent>,
    public dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.metadata_type = data.metadata_type;
    }

  ngOnInit(): void {
  }

  public onClose() {
    this.dialogRef.close();
  }

  public onSave() {
    // tslint:disable-next-line:max-line-length
    this.dataService.storeMetadataType({ metadata_type: this.metadata_type, label: this.newMetadataTypeLabel }).subscribe(serverResponse => {
      if (serverResponse['success']) {
        const newMetadataItem = serverResponse['data']['new_item'];
        this.dataService.addMetadata(serverResponse['data']['metadata_type'], newMetadataItem);
        this.dialogRef.close(newMetadataItem);
      } else {
        alert(serverResponse['error']);
      }
    });
  }

}
