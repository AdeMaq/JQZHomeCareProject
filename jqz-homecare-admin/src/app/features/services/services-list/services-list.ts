import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Service, ServiceService } from '../../../core/services/service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-list.html',
  styleUrl: './services-list.css',
})
export class ServicesList implements OnInit {
  private serviceService = inject(ServiceService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  services: Service[] = [];

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadServices();
  }

  // =========================
  // LOAD SERVICES
  // =========================

  loadServices(): void {
    console.log('LOAD SERVICES STARTED');

    this.isLoading = true;
    this.errorMessage = '';

    // Refresh view immediately
    this.cdr.detectChanges();

    this.serviceService.getServices().subscribe({
      next: (response) => {
        console.log('GET SERVICES SUCCESS:', response);

        this.services = response;

        console.log('SERVICES ARRAY:', this.services);

        this.isLoading = false;

        console.log('IS LOADING:', this.isLoading);

        // IMPORTANT:
        // Force Angular to update the HTML after HTTP response
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('ERROR LOADING SERVICES:', error);

        this.services = [];
        this.isLoading = false;
        this.errorMessage = 'Unable to load services. Please try again.';

        // Force Angular to update the error state
        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // ADD SERVICE
  // =========================

  addService(): void {
    this.router.navigate(['/services/add']);
  }

  // =========================
  // SERVICE CATEGORIES
  // =========================

  viewCategories(): void {
    this.router.navigate(['/service-categories']);
  }

  // =========================
  // EDIT SERVICE
  // =========================

  editService(service: Service): void {
    this.router.navigate(['/services', service.id, 'edit']);
  }

  // =========================
  // DELETE SERVICE
  // =========================

  deleteService(service: Service): void {
    const confirmed = window.confirm(`Are you sure you want to delete "${service.name}"?`);

    if (!confirmed) {
      return;
    }

    this.serviceService.deleteService(service.id).subscribe({
      next: () => {
        console.log('SERVICE DELETED SUCCESSFULLY');

        this.loadServices();
      },

      error: (error) => {
        console.error('ERROR DELETING SERVICE:', error);

        alert('Unable to delete the service. Please try again.');
      },
    });
  }
}
