import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';

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
export class Sidebar implements OnInit, OnDestroy {
  /*
   * =====================================================
   * INPUTS / OUTPUTS
   * =====================================================
   */

  @Input() isOpen = false;

  @Output() closeSidebar = new EventEmitter<void>();

  @Output() collapsedChange = new EventEmitter<boolean>();

  /*
   * =====================================================
   * DESKTOP / TABLET SIDEBAR STATE
   * =====================================================
   *
   * false = expanded
   * true  = collapsed
   */

  isCollapsed = false;

  /*
   * =====================================================
   * SIDEBAR MENU
   * =====================================================
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
      label: 'Operations',

      items: [
        {
          icon: 'fa-solid fa-calendar-check',
          label: 'Visits',
          route: '/visits',
        },

        {
          icon: 'fa-solid fa-user-doctor',
          label: 'Practitioners',
          route: '/practitioners',
        },

        {
          icon: 'fa-solid fa-money-bill-transfer',
          label: 'Payments',
          route: '/payments',
        },
      ],
    },

    {
      label: 'Management',

      items: [
        {
          icon: 'fa-solid fa-box-open',
          label: 'Packages',
          route: '/packages',
        },

        {
          icon: 'fa-solid fa-briefcase-medical',
          label: 'Services',
          route: '/services',
        },
      ],
    },

    {
      label: 'Locations',

      items: [
        {
          icon: 'fa-solid fa-location-dot',
          label: 'Areas',
          route: '/areas',
        },

        {
          icon: 'fa-solid fa-city',
          label: 'Cities',
          route: '/cities',
        },
      ],
    },

    {
      label: 'Quality',

      items: [
        {
          icon: 'fa-solid fa-star',
          label: 'Ratings',
          route: '/ratings',
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
   * RESPONSIVE BREAKPOINTS
   * =====================================================
   */

  private readonly mobileBreakpoint = 768;

  private readonly tabletBreakpoint = 1200;

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
   * LIFECYCLE
   * =====================================================
   */

  ngOnInit(): void {
    this.updateSidebarForViewport();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }

  /*
   * =====================================================
   * WINDOW RESIZE
   * =====================================================
   */

  private onWindowResize = (): void => {
    this.updateSidebarForViewport();
  };

  private updateSidebarForViewport(): void {
    const width = window.innerWidth;

    /*
     * MOBILE
     *
     * Sidebar is always visually expanded when opened.
     */

    if (width <= this.mobileBreakpoint) {
      this.isCollapsed = false;

      this.collapsedChange.emit(false);

      return;
    }

    /*
     * TABLET / MEDIUM DESKTOP
     *
     * Default to compact icon sidebar.
     */

    if (width < this.tabletBreakpoint) {
      this.isCollapsed = true;

      this.collapsedChange.emit(true);

      return;
    }

    /*
     * LARGE DESKTOP
     */

    this.isCollapsed = false;

    this.collapsedChange.emit(false);
  }

  /*
   * =====================================================
   * INITIALIZE RESIZE LISTENER
   * =====================================================
   */

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.onWindowResize);
  }

  /*
   * =====================================================
   * DESKTOP SIDEBAR TOGGLE
   * =====================================================
   */

  toggleSidebar(): void {
    /*
     * Sidebar should not collapse on mobile.
     */

    if (window.innerWidth <= this.mobileBreakpoint) {
      return;
    }

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

    if (window.innerWidth <= this.mobileBreakpoint) {
      this.closeSidebar.emit();
    }
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
