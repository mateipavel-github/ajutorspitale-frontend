import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormArray, FormControl } from '@angular/forms';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit } from '@angular/core';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-metadata-editor',
  templateUrl: './metadata-editor.component.html',
  styleUrls: ['./metadata-editor.component.css']
})
export class MetadataEditorComponent implements OnInit {

  metadataTypes;
  selectedMetadata;
  metadata;
  editForm: FormGroup;
  deleteForm: FormGroup;
  typeSelector: FormControl = new FormControl();
  deletable;
  deleting = false;

  constructor(public dataService: DataService, private route: ActivatedRoute, private snackBar: MatSnackBar) {
    this.metadataTypes = Object.keys(this.dataService.metadata);
    this.metadata = this.dataService.metadata;

    this.editForm = new FormGroup({
      'items': new FormArray([])
    });

    this.deleteForm = new FormGroup({
      'merge_into_id': new FormControl()
    });

    this.route.paramMap.subscribe(params => {
      if (params.get('type')) {
        this.selectedMetadata = params.get('type');
        this.clearPrevious();
        this.metadata[this.selectedMetadata].forEach(item => {
          const f = new FormGroup({
            'id': new FormControl(item.id),
            'label': new FormControl(item.label),
            'slug': new FormControl(item.slug),
            'sort_order': new FormControl(item.sort_order)
          });
          (<FormArray>this.editForm.get('items')).controls.push(f);
        });
      }
    });
  }

  clearPrevious() {
    this.getAsFormArray('items').controls.splice(0, this.getAsFormArray('items').length);
  }

  ngOnInit(): void { }

  onAddItem() {
    // tslint:disable-next-line:max-line-length
    const f = new FormGroup({ 'id': new FormControl(), 'label': new FormControl(), 'slug': new FormControl(), 'sort_order': new FormControl() });
    this.getAsFormArray('items').push(f);
  }


  onRemoveItem(index) {
    const item = this.getAsFormArray('items').controls[index].value;
    if (item.id) {
      this.deletable = item;
    } else {
      this.getAsFormArray('items').removeAt(index);
    }
  }

  findIndexById(id) {
    let found = 0;
    this.getAsFormArray('items').controls.some((control, index) => {
      if (control.value.id === id) {
        found = index;
        return true;
      }
    });
    return found;
  }

  onDelete() {

    if (this.deleteForm.valid) {
      this.deleting = true;
      this.dataService.removeMetadataItem(this.selectedMetadata,
        this.deletable.id, this.deleteForm.get('merge_into_id').value).subscribe(serverResponse => {
          this.deleting = false;
          if (serverResponse['success']) {
            // remove from UI
            this.getAsFormArray('items').removeAt(this.findIndexById(this.deletable.id));
            // remove from dataService as well
            _.remove(this.dataService.metadata[this.selectedMetadata], (v, i, a) => v['id'] === this.deletable.id);
            this.deletable = null;
          } else {
            alert(serverResponse['error']);
          }
        }, error => {
          this.deleting = false;
          alert(error);
        });
    }
  }

  onSaveItem(index) {
    // tslint:disable-next-line:max-line-length

    const ctrl = this.getAsFormArray('items').controls[index];
    ctrl.disable();

    const item = ctrl.value;
    // is this an ID change?
    if (this.metadata[this.selectedMetadata][index] && this.metadata[this.selectedMetadata][index].id !== item.id) {
      item.new_id = item.id;
      item.id = this.metadata[this.selectedMetadata][index].id;
    }

    if (item.label && item.label.length > 0) {
      this.dataService.saveMetadataItem({ ...{ 'metadata_type': this.selectedMetadata }, ...item }).subscribe(serverResponse => {
        ctrl.enable();
        if (serverResponse['success']) {
          if (!ctrl.value.id) {
            this.dataService.metadata[this.selectedMetadata].push(serverResponse['data']['new_item']);
          } else {
            this.dataService.metadata[this.selectedMetadata][index] = serverResponse['data']['new_item'];
          }
          // update ID if necessary
          ctrl.setValue(serverResponse['data']['new_item']);
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
      }, error => {
        ctrl.enable();
        alert(error);
      });
    }
  }

  getAsFormArray(key) {
    return <FormArray>this.editForm.get(key);
  }

}
