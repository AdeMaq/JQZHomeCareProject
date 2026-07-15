import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  hidePassword = true;

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

}