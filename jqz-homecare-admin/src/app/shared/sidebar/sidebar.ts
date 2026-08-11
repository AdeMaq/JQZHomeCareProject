import { Component, EventEmitter, Input, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() isOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();

  /*
   * =====================================================
   * SIDEBAR MENU ITEMS
   * =====================================================
   *
   * These routes match app.routes.ts.
   *
   * Dashboard
   * Services
   * Cities
   * Areas
   * Practitioners
   *
   */

  menuItems = [
    {
      icon: 'fa-solid fa-house',
      label: 'Dashboard',
      route: '/dashboard',
    },

    {
      icon: 'fa-solid fa-briefcase',
      label: 'Services',
      route: '/services',
    },

    {
      icon: 'fa-solid fa-city',
      label: 'Cities',
      route: '/cities',
    },

    {
      icon: 'fa-solid fa-location-dot',
      label: 'Areas',
      route: '/areas',
    },

    {
      icon: 'fa-solid fa-user-doctor',
      label: 'Practitioners',
      route: '/practitioners',
    },
  ];

  /*
   * =====================================================
   * CURRENT ROUTE
   * =====================================================
   */

  currentRoute = '';

  constructor(private router: Router) {
    /*
     * Get the current route immediately when
     * the sidebar is created.
     */
    this.currentRoute = this.router.url;

    /*
     * Listen for route changes.
     *
     * This ensures the active sidebar item changes
     * automatically whenever navigation happens.
     */
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;

        this.currentRoute = navigation.urlAfterRedirects;
      });
  }

  /*
   * =====================================================
   * CLOSE MOBILE SIDEBAR
   * =====================================================
   */

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  /*
   * =====================================================
   * MENU ITEM CLICK
   * =====================================================
   */

  onMenuItemClick(route: string): void {
    /*
     * Navigate to the selected page.
     */
    this.router.navigate([route]);

    /*
     * Close sidebar on mobile.
     *
     * On desktop this has no harmful effect because
     * the parent component controls whether the sidebar
     * is actually visible.
     */
    this.closeSidebar.emit();
  }

  /*
   * =====================================================
   * ACTIVE MENU ITEM
   * =====================================================
   */

  isActive(route: string): boolean {
    /*
     * Exact match:
     *
     * /services
     * /cities
     * /areas
     * /practitioners
     *
     * OR child route:
     *
     * /services/123/edit
     * /cities/123/edit
     * /areas/123/edit
     * /practitioners/123
     * /practitioners/123/edit
     * /practitioners/123/areas
     */

    return this.currentRoute === route || this.currentRoute.startsWith(`${route}/`);
  }
}
