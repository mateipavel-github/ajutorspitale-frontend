import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { TitleCasePipe } from '@angular/common';


@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit, OnChanges {

  @Input() notes = [];
  @Input() itemId = 0;
  @Input() itemType = '';
  @Output() noteAddSuccess: EventEmitter<any> = new EventEmitter();
  @Output() noteAddError: EventEmitter<any> = new EventEmitter();

  newNote: FormControl = new FormControl();

  constructor(private dataService: DataService) {

  }

  onSaveNote() {

    if (this.itemId === 0) {
      alert('Salvează înainte să poți adăuga notițe');
    } else {

      this.newNote.disable();
      const data = { item_id: this.itemId, content: this.newNote.value };

      const dataServiceFunction = 'add' + this.itemType.substr(0, 1).toUpperCase() + this.itemType.toLowerCase().substr(1) + 'Note';

      this.dataService[dataServiceFunction](data).subscribe(serverResponse => {
        this.newNote.enable();
        this.newNote.setValue('');
        if (serverResponse['success']) {
          this.notes.push(serverResponse['data']['new_note']);
          this.noteAddSuccess.emit(serverResponse.data['new_note']);
        }
      }, error => {
        this.newNote.enable();
        this.newNote.setValue('');
        this.noteAddError.emit(error);
      });
    }
  }

  ngOnChanges(): void {
    if (this.itemType.length === 0) {
      console.warn('<app-notes> component requires itemType to be set');
    }
    this.itemId = typeof (this.itemId) === 'string' ? 0 : this.itemId;
    if (this.itemId === 0) {
      this.newNote.disable();
    } else {
      this.newNote.enable();
    }
  }

  getTypeLabel() {
    const mappings = {
      delivery: 'livrarea',
      request: 'cererea',
      offer: 'oferta'
    };

    return mappings[this.itemType];
  }

  ngOnInit(): void {

  }

}
