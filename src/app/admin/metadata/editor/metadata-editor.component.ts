import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit } from '@angular/core';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';

@Component({
  selector: 'app-metadata-editor',
  templateUrl: './metadata-editor.component.html',
  styleUrls: ['./metadata-editor.component.css']
})
export class MetadataEditorComponent implements OnInit {

  metadataTypes;
  metadata;
  editForm: FormGroup;

  constructor(public dataService: DataService, private snackBar: MatSnackBar) {
    this.metadataTypes = Object.keys(this.dataService.metadata);
    this.metadata = this.dataService.metadata;
  }

  ngOnInit(): void {
    let items;
    this.editForm = new FormGroup({});
    this.metadataTypes.forEach(metadataType => {
      items = [];
      this.metadata[metadataType].forEach(item => {
        // tslint:disable-next-line:max-line-length
        items.push(new FormGroup({ 'id': new FormControl(item.id), 'label': new FormControl(item.label), 'slug': new FormControl(item.slug) }));
      });
      this.editForm.addControl(metadataType, new FormArray(items));
    });
  }

  onAddItem(metadataType) {
    const f = new FormGroup({ 'id': new FormControl(), 'label': new FormControl(), 'slug': new FormControl() });
    this.getAsFormArray(metadataType).push(f);
  }

  onRemoveItem(metadataType, index) {
    alert('Not implemented');
    return;
    // remove from server
    const item = this.getAsFormArray(metadataType).controls[index].value;
    if (item.id) {
      this.dataService.removeMetadataItem(metadataType, this.metadata[metadataType][index].id).subscribe(serverResponse => {
        if (serverResponse['success']) {
          // remove from UI
          this.getAsFormArray(metadataType).removeAt(index);
        } else {
          alert(serverResponse['error']);
        }
      });
    } else {
      this.getAsFormArray(metadataType).removeAt(index);
    }
  }

  onSaveItem(metadataType, index) {
    // tslint:disable-next-line:max-line-length
    const item = this.getAsFormArray(metadataType).controls[index].value;
    // is this an ID change?
    if (this.metadata[metadataType][index] && this.metadata[metadataType][index].id !== item.id) {
      item.new_id = item.id;
      item.id = this.metadata[metadataType][index].id;
    }

    if (item.label && item.label.length > 0) {
      this.dataService.saveMetadataItem({ ...{ 'metadata_type': metadataType }, ...item }).subscribe(serverResponse => {
        if (serverResponse['success']) {
          // update ID if necessary
          this.getAsFormArray(metadataType).controls[index].setValue(serverResponse['data']['new_item']);
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: 'Succes' },
            panelClass: 'snackbar-success'
          });
        } else {
          this.snackBar.openFromComponent(SnackbarComponent, {
            data: { message: serverResponse['error'] },
            panelClass: 'snackbar-error'
          });
        }
      });
    }
  }

  getAsFormArray(key) {
    return <FormArray>this.editForm.get(key);
  }

}
