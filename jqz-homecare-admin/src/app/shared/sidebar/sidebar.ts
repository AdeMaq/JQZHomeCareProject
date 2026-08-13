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
  /*
   * =====================================================
   * INPUTS / OUTPUTS
   * =====================================================
   */

  /*
   * Mobile sidebar state.
   *
   * Controlled by AdminLayout.
   */
  @Input() isOpen = false;

  /*
   * Emits when the mobile sidebar should be closed.
   */
  @Output() closeSidebar = new EventEmitter<void>();

  /*
   * Emits whenever the desktop sidebar changes between
   * expanded and collapsed.
   *
   * false = expanded
   * true  = collapsed
   */
  @Output() collapsedChange = new EventEmitter<boolean>();

  /*
   * =====================================================
   * DESKTOP SIDEBAR STATE
   * =====================================================
   */

  isCollapsed = false;

  /*
   * =====================================================
   * SIDEBAR MENU
   * =====================================================
   *
   * Application workflow:
   *
   * Overview
   *   Dashboard
   *
   * Healthcare
   *   Services
   *   Packages
   *   Practitioners
   *
   * Locations
   *   Cities
   *   Areas
   */

  menuSections = [
    {
      label: 'Overview',

      items: [
        {
          icon: 'fa-solid fa-house',
          label: 'Dashboard',
          route: '/dashboard',
        },
      ],
    },

    {
      label: 'Healthcare',

      items: [
        {
          icon: 'fa-solid fa-briefcase-medical',
          label: 'Services',
          route: '/services',
        },

        {
          icon: 'fa-solid fa-box-open',
          label: 'Packages',
          route: '/packages',
        },

        {
          icon: 'fa-solid fa-user-doctor',
          label: 'Practitioners',
          route: '/practitioners',
        },
      ],
    },

    {
      label: 'Locations',

      items: [
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
      ],
    },
  ];

  /*
   * =====================================================
   * CURRENT ROUTE
   * =====================================================
   */

  currentRoute = '';

  /*
   * =====================================================
   * CONSTRUCTOR
   * =====================================================
   */

  constructor(private router: Router) {
    this.currentRoute = this.router.url;

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navigation = event as NavigationEnd;

        this.currentRoute = navigation.urlAfterRedirects;
      });
  }

  /*
   * =====================================================
   * DESKTOP SIDEBAR TOGGLE
   * =====================================================
   *
   * Hamburger button:
   *
   * Expanded  -> Collapsed
   * Collapsed -> Expanded
   */

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;

    this.collapsedChange.emit(this.isCollapsed);
  }

  /*
   * =====================================================
   * MOBILE SIDEBAR CLOSE
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
    this.router.navigate([route]);

    /*
     * Close mobile drawer after navigation.
     */
    this.closeSidebar.emit();
  }

  /*
   * =====================================================
   * ACTIVE MENU ITEM
   * =====================================================
   */

  isActive(route: string): boolean {
    return this.currentRoute === route || this.currentRoute.startsWith(`${route}/`);
  }

  /*
   * =====================================================
   * ACTIVE SECTION
   * =====================================================
   */

  isSectionActive(items: { route: string }[]): boolean {
    return items.some((item) => this.isActive(item.route));
  }
}
