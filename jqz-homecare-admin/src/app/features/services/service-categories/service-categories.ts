import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  ServiceService,
  ServiceCategory,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
} from '../../../core/services/service';

@Component({
  selector: 'app-service-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-categories.html',
  styleUrl: './service-categories.css',
})
export class ServiceCategories implements OnInit {
  private readonly serviceService = inject(ServiceService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // DATA
  // =========================

  categories: ServiceCategory[] = [];

  // =========================
  // LOADING STATES
  // =========================

  isLoading = false;
  isSaving = false;
  isDeleting = false;

  // =========================
  // MESSAGES
  // =========================

  errorMessage = '';
  successMessage = '';

  // =========================
  // FORM STATE
  // =========================

  showForm = false;
  isEditMode = false;

  selectedCategoryId: string | null = null;
  categoryName = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    console.log('ServiceCategories initialized');

    this.loadCategories();
  }

  // =========================
  // LOAD CATEGORIES
  // =========================

  loadCategories(): void {
    console.log('Loading service categories...');

    this.isLoading = true;
    this.errorMessage = '';

    // Immediately update loading state.
    this.cdr.detectChanges();

    this.serviceService
      .getServiceCategories()
      .pipe(
        finalize(() => {
          console.log('Finished loading service categories.');

          this.isLoading = false;

          // IMPORTANT:
          // Force Angular to update the view after the HTTP request finishes.
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (categories) => {
          console.log('Service categories received:', categories);

          this.categories = categories ?? [];

          console.log('Categories assigned:', this.categories);
          console.log('Category count:', this.categories.length);

          // IMPORTANT:
          // Force the table/count to render immediately.
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Unable to load service categories:', error);

          this.categories = [];

          this.errorMessage =
            error?.error?.message ?? 'Unable to load service categories. Please try again.';

          this.isLoading = false;

          this.cdr.detectChanges();
        },
      });
  }

  // =========================
  // OPEN ADD FORM
  // =========================

  openAddForm(): void {
    this.clearMessages();

    this.resetForm();

    this.isEditMode = false;
    this.showForm = true;

    this.cdr.detectChanges();
  }

  // =========================
  // OPEN EDIT FORM
  // =========================

  openEditForm(category: ServiceCategory): void {
    this.clearMessages();

    this.isEditMode = true;
    this.showForm = true;

    this.selectedCategoryId = category.id;
    this.categoryName = category.name;

    this.cdr.detectChanges();
  }

  // =========================
  // CLOSE FORM
  // =========================

  closeForm(): void {
    if (this.isSaving) {
      return;
    }

    this.showForm = false;

    this.resetForm();

    this.cdr.detectChanges();
  }

  // =========================
  // SAVE CATEGORY
  // =========================

  saveCategory(): void {
    this.clearMessages();

    const name = this.categoryName.trim();

    // Validation
    if (!name) {
      this.errorMessage = 'Category name is required.';

      this.cdr.detectChanges();

      return;
    }

    // Edit validation
    if (this.isEditMode && !this.selectedCategoryId) {
      this.errorMessage = 'Unable to identify the category being edited.';

      this.cdr.detectChanges();

      return;
    }

    this.isSaving = true;

    this.cdr.detectChanges();

    if (this.isEditMode) {
      const request: UpdateServiceCategoryRequest = {
        name,
      };

      this.updateCategory(this.selectedCategoryId!, request);
    } else {
      const request: CreateServiceCategoryRequest = {
        name,
      };

      this.createCategory(request);
    }
  }

  // =========================
  // CREATE CATEGORY
  // =========================

  private createCategory(request: CreateServiceCategoryRequest): void {
    this.serviceService.createServiceCategory(request).subscribe({
      next: (createdCategory) => {
        console.log('Category created:', createdCategory);

        this.isSaving = false;

        this.showForm = false;

        this.resetForm();

        this.successMessage = 'Service category created successfully.';

        /*
         * Refresh the table from backend.
         */
        this.loadCategories();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error creating category:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message ?? 'Unable to create service category. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // UPDATE CATEGORY
  // =========================

  private updateCategory(id: string, request: UpdateServiceCategoryRequest): void {
    this.serviceService.updateServiceCategory(id, request).subscribe({
      next: () => {
        console.log('Category updated:', id);

        this.isSaving = false;

        this.showForm = false;

        this.resetForm();

        this.successMessage = 'Service category updated successfully.';

        /*
         * Refresh the table from backend.
         */
        this.loadCategories();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error updating category:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message ?? 'Unable to update service category. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // DELETE CATEGORY
  // =========================

  deleteCategory(category: ServiceCategory): void {
    this.clearMessages();

    const confirmed = window.confirm(`Are you sure you want to delete "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    this.isDeleting = true;

    this.cdr.detectChanges();

    this.serviceService.deleteServiceCategory(category.id).subscribe({
      next: () => {
        console.log('Category deleted:', category.id);

        this.isDeleting = false;

        this.successMessage = 'Service category deleted successfully.';

        /*
         * Refresh the table after deletion.
         */
        this.loadCategories();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Error deleting category:', error);

        this.isDeleting = false;

        this.errorMessage =
          error?.error?.message ??
          'Unable to delete service category. It may be in use by a service.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // RESET FORM
  // =========================

  private resetForm(): void {
    this.selectedCategoryId = null;

    this.categoryName = '';

    this.isEditMode = false;
  }

  // =========================
  // CLEAR MESSAGES
  // =========================

  private clearMessages(): void {
    this.errorMessage = '';

    this.successMessage = '';
  }
}
