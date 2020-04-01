import { Router } from '@angular/router';
import { AuthService } from './../../_services/auth.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginRequestDone = true;
  loginRequestError = false;
  loginRequestSucces = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.loginRequestDone = false;
    this.loginRequestError = false;
    this.authService.login(this.loginForm.value).subscribe(loginResult => {
      this.loginRequestDone = true;
      if (!loginResult.success) {
        this.loginRequestError = true;
      } else {
        this.loginRequestSucces = true;
        this.router.navigate(['admin']);
      }
    });
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      'login_identifier': new FormControl(),
      'password': new FormControl()
    });
  }

}
