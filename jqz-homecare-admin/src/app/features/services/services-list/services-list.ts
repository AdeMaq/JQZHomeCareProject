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
  private readonly serviceService = inject(ServiceService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // COMPONENT STATE
  // =========================

  services: Service[] = [];

  searchTerm = '';

  isLoading = false;

  errorMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.loadServices();
  }

  // =========================
  // LOAD SERVICES
  // =========================

  loadServices(): void {
    console.log('=================================');
    console.log('LOAD SERVICES STARTED');
    console.log('=================================');

    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.detectChanges();

    this.serviceService.getServices().subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: (response: Service[]) => {
        console.log('GET SERVICES SUCCESS:', response);

        this.services = Array.isArray(response) ? response : [];

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('SERVICES:', this.services);
        console.log('SERVICE COUNT:', this.services.length);
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('=================================');
        console.error('ERROR LOADING SERVICES');
        console.error('Error:', error);
        console.error('=================================');

        this.services = [];

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load services. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // FILTERED SERVICES
  // =========================

  get filteredServices(): Service[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.services;
    }

    return this.services.filter((service) => {
      const serviceName = service.name?.toLowerCase() ?? '';

      const categoryName = service.serviceCategoryName?.toLowerCase() ?? '';

      const description = service.description?.toLowerCase() ?? '';

      return (
        serviceName.includes(search) ||
        categoryName.includes(search) ||
        description.includes(search)
      );
    });
  }

  // =========================
  // SEARCH
  // =========================

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  // =========================
  // ADD SERVICE
  // =========================

  addService(): void {
    console.log('ADD SERVICE clicked');

    this.router.navigate(['/services/add']);
  }

  // =========================
  // SERVICE CATEGORIES
  // =========================

  viewCategories(): void {
    console.log('SERVICE CATEGORIES clicked');

    this.router.navigate(['/service-categories']);
  }

  // =========================
  // EDIT SERVICE
  // =========================

  editService(service: Service): void {
    console.log('EDIT SERVICE clicked');
    console.log('Service ID:', service.id);

    this.router.navigate(['/services', service.id, 'edit']);
  }

  // =========================
  // DELETE SERVICE
  // =========================

  deleteService(service: Service): void {
    console.log('DELETE SERVICE clicked');
    console.log('Service ID:', service.id);

    const confirmed = window.confirm(`Are you sure you want to delete "${service.name}"?`);

    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    this.serviceService.deleteService(service.id).subscribe({
      // =========================
      // DELETE SUCCESS
      // =========================

      next: () => {
        console.log('SERVICE DELETED SUCCESSFULLY');

        /*
         * Remove the service directly from the existing
         * array instead of loading the entire page again.
         */
        this.services = this.services.filter((currentService) => currentService.id !== service.id);

        this.cdr.detectChanges();
      },

      // =========================
      // DELETE ERROR
      // =========================

      error: (error) => {
        console.error('ERROR DELETING SERVICE:', error);

        const message =
          error?.error?.message ??
          error?.message ??
          'Unable to delete the service. Please try again.';

        alert(message);

        this.cdr.detectChanges();
      },
    });
  }
}
