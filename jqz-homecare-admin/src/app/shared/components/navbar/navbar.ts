import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  /*
   * =====================================================
   * MOBILE MENU EVENT
   * =====================================================
   *
   * Sends the hamburger click to AdminLayout.
   */

  @Output() menuToggle = new EventEmitter<void>();

  constructor(private router: Router) {}

  /*
   * =====================================================
   * MOBILE HAMBURGER
   * =====================================================
   */

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('role');
    }

    this.router.navigate(['/login']);
  }
}
