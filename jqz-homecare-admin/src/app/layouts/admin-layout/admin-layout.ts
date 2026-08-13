import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Sidebar } from '../../shared/sidebar/sidebar';
import { Navbar } from '../../shared/components/navbar/navbar';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar, Navbar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  /*
   * =====================================================
   * MOBILE SIDEBAR STATE
   * =====================================================
   */

  isMobileSidebarOpen = false;

  /*
   * =====================================================
   * DESKTOP SIDEBAR STATE
   * =====================================================
   *
   * false = expanded
   * true  = collapsed
   */

  isSidebarCollapsed = false;

  /*
   * =====================================================
   * MOBILE HAMBURGER
   * =====================================================
   */

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  /*
   * =====================================================
   * CLOSE MOBILE SIDEBAR
   * =====================================================
   */

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  /*
   * =====================================================
   * DESKTOP SIDEBAR STATE
   * =====================================================
   */

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}
