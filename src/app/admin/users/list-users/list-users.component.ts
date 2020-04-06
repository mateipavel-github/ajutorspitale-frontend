import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConstants } from './../../../app-constants';
import { DataService } from 'src/app/_services/data.service';
import { Component, OnInit, ViewChild, ɵNOT_FOUND_CHECK_ONLY_ELEMENT_INJECTOR } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective } from '@angular/forms';
import { MatTable } from '@angular/material/table';
import { SnackbarComponent } from 'src/app/_shared/snackbar/snackbar.component';
import { Title } from '@angular/platform-browser';


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

  constructor(public dataService: DataService, private snackBar: MatSnackBar, private titleService: Title) {

    this.AppConstants = AppConstants;

    this.dataService.getUsers().subscribe(serverResponse => {
      this.usersLoaded = true;
      this.users = serverResponse['data']['items'];
    });

    this.titleService.setTitle('Utilizatori | ' + this.titleService.getTitle());

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
    if (data.email === '' || data.email === null) {
      delete data.email;
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
    }, error => {
        this.formLoading = false;
        this.snackBar.openFromComponent(SnackbarComponent, {
          data: { message: error.message },
          panelClass: 'snackbar-error'
        });
    });
  }

  public findUserIndexById(id) {
    let foundIndex = null;
    this.users.forEach((user, index) => {
      if (user.id === id) {
        foundIndex = index;
        return;
      }
    });
    return foundIndex;
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
    }, error => {
        alert(error);
    });
  }

  resetForm() {
    this.userEditForm.get('password').setValidators([Validators.required]);
    this.userEditForm.reset();
    this.userFormDirective.resetForm();
  }

}
