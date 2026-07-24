import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  menuItems = [
    {
      icon: 'fa-solid fa-house',
      label: 'Dashboard',
      active: true,
    },
    {
      icon: 'fa-solid fa-user-doctor',
      label: 'Therapists',
      active: false,
    },
    {
      icon: 'fa-solid fa-users',
      label: 'Patients',
      active: false,
    },
    {
      icon: 'fa-solid fa-calendar-days',
      label: 'Appointments',
      active: false,
    },
    {
      icon: 'fa-solid fa-file-medical',
      label: 'Medical Records',
      active: false,
    },
    {
      icon: 'fa-solid fa-chart-line',
      label: 'Reports',
      active: false,
    },
    {
      icon: 'fa-solid fa-gear',
      label: 'Settings',
      active: false,
    },
  ];

  onCloseSidebar(): void {
    this.closeSidebar.emit();
  }

  onMenuItemClick(): void {
    this.closeSidebar.emit();
  }
}
