import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/login-request';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  hidePassword = true;

  private authService = inject(AuthService);
  private router = inject(Router);

  loginRequest: LoginRequest = {
    email: '',
    password: '',
  };

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  login(): void {
    console.log('Login button clicked');
    console.log(this.loginRequest);

    this.authService.login(this.loginRequest).subscribe({
      next: (response) => {
        console.log('API Success');
        console.log(response);

        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('role', response.role.toString());
        console.log('Token stored in localStorage:', response.token);
        console.log('User ID stored in localStorage:', response.userId);
        console.log('Role stored in localStorage:', response.role);
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {
        console.log('API Error');
        console.log(error);

        alert('Invalid Email or Password');
      },
    });
  }
}
