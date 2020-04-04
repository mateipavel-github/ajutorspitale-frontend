import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from './../../../app-constants';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit {

  @ViewChild(FormGroupDirective) userFormDirective;

  users;
  usersLoaded = false;
  formLoading = false;
  userEditForm: FormGroup;
  displayedColumns: string[] = ['id', 'name', 'email', 'phone_number', 'role', 'actions'];

  @ViewChild(MatTable) usersTable: MatTable<any>;
  AppConstants;

  constructor(public dataService: DataService, private snackBar: MatSnackBar) {

    this.AppConstants = AppConstants;

    this.dataService.getUsers().subscribe(serverResponse => {
      this.usersLoaded = true;
      this.users = serverResponse['data']['items'];
    });

  }

  ngOnInit(): void {
    this.userEditForm = new FormGroup({
        id: new FormControl(null),
        name: new FormControl(null, [Validators.required]),
        phone_number: new FormControl(null, [Validators.required, Validators.pattern(AppConstants.phone_number_pattern)]),
        role_type_id: new FormControl(null, [Validators.required]),
        email: new FormControl(null, [Validators.email]),
        password: new FormControl(null, [Validators.required])
    });
  }

  onEditUser(index) {
    const data = this.users[index];
    this.userEditForm.get('password').clearValidators();
    this.userEditForm.setValue({
      id: data.id,
      name: data.name,
      email: data.email,
      phone_number: data.phone_number,
      role_type_id: data.role_type_id,
      password: ''
    });
  }

  onSaveUser() {
    const data = this.userEditForm.value;
    if (data.id > 0 && !data.password) {
      delete data.password;
    }
    this.formLoading = true;
    this.dataService.saveUser(this.userEditForm.value).subscribe(serverResponse => {
      this.formLoading = false;
      if (serverResponse['success']) {
        if (data.id > 0) {
          this.users[this.findUserIndexById(data.id)] = serverResponse['data']['item'];
        } else {
          this.users.push(serverResponse['data']['item']);
        }
        this.usersTable.renderRows();
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Succes' },
          panelClass: 'snackbar-success'
        });
        this.resetForm();
      } else {
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: 'Ceva nu a mers...' },
          panelClass: 'snackbar-error'
        });
      }
    });
  }

  public findUserIndexById(id) {
    this.users.forEach((user, index) => {
      if (user.id === id) {
        return index;
      }
    });
    return null;
  }

  onDeleteUser(index) {
    const id = this.users[index].id;
    this.dataService.deleteUser(id).subscribe(serverResponse => {
      if (serverResponse['success']) {
        this.users.splice(this.findUserIndexById(id), 1);
        this.usersTable.renderRows();
      } else {
        alert(serverResponse['error']);
      }
    });
  }

  resetForm() {
    this.userEditForm.get('password').setValidators([Validators.required]);
    this.userEditForm.reset();
    this.userFormDirective.resetForm();
  }

}
