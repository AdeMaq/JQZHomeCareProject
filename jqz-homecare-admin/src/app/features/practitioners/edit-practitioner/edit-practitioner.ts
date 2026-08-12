import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../../core/services/auth.service';

import {
  Practitioner,
  PractitionerService,
  Service,
  UpdatePractitionerRequest,
  ResetPractitionerPasswordRequest,
} from '../../../core/services/practitioner';

@Component({
  selector: 'app-edit-practitioner',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-practitioner.html',
  styleUrl: './edit-practitioner.css',
})
export class EditPractitioner implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);

  // ============================================================
  // BASIC DATA
  // ============================================================

  practitionerId = '';

  practitioner: Practitioner | null = null;

  services: Service[] = [];

  // ============================================================
  // LOADING / ERROR STATES
  // ============================================================

  isLoading = true;

  isSaving = false;

  hasError = false;

  saveError = '';

  // ============================================================
  // RESET PASSWORD STATES
  // ============================================================

  canResetPassword = false;

  isResettingPassword = false;

  resetPasswordError = '';

  resetPasswordSuccess = '';

  showNewPassword = false;

  // ============================================================
  // FORM
  // ============================================================

  form = {
    name: '',
    phone: '',
    email: '',
    serviceId: '',
    serviceName: '',
    education: '',
    priority: 1,
    sharePercentage: 0,
  };

  // ============================================================
  // RESET PASSWORD FORM
  // ============================================================

  passwordForm = {
    newPassword: '',
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {
    this.setResetPasswordPermission();

    console.log('=================================');
    console.log('EDIT PRACTITIONER INITIALIZED');
    console.log('=================================');

    const id = this.route.snapshot.paramMap.get('id');

    console.log('Route practitioner ID:', id);

    if (!id) {
      console.error('No practitioner ID found.');

      this.practitioner = null;
      this.hasError = true;
      this.isLoading = false;

      this.changeDetector.detectChanges();

      return;
    }

    this.practitionerId = id;

    this.loadPractitioner(id);
    this.loadServices();
  }

  // ============================================================
  // RESET PASSWORD PERMISSION
  // ============================================================

  private setResetPasswordPermission(): void {
    const role = localStorage.getItem('role');

    /*
     * Backend UserRole enum:
     *
     * SuperAdmin       = 0
     * MiddlePowerAdmin = 1
     * SimpleAdmin      = 2
     * Practitioner     = 3
     *
     * localStorage stores the numeric enum value as a string.
     *
     * Therefore:
     *
     * "0" = SuperAdmin
     * "1" = MiddlePowerAdmin
     * "2" = SimpleAdmin
     * "3" = Practitioner
     */

    this.canResetPassword = role === '0' || role === '1';

    console.log('Logged-in admin role:', role);
    console.log('Can reset practitioner password:', this.canResetPassword);
  }

  // ============================================================
  // LOAD PRACTITIONER
  // ============================================================

  private loadPractitioner(id: string): void {
    console.log('Requesting practitioner:', id);

    this.practitionerService.getPractitionerById(id).subscribe({
      next: (practitioner) => {
        console.log('=================================');
        console.log('PRACTITIONER RESPONSE RECEIVED');
        console.log('=================================');
        console.log(practitioner);

        try {
          if (!practitioner) {
            throw new Error('Practitioner response is empty.');
          }

          this.practitioner = practitioner;

          this.form = {
            name: practitioner.name ?? '',
            phone: practitioner.phone ?? '',
            email: practitioner.email ?? '',
            serviceId: practitioner.serviceId ?? '',
            serviceName: practitioner.serviceName ?? '',
            education: practitioner.education ?? '',
            priority: practitioner.priority ?? 1,
            sharePercentage: practitioner.sharePercentage ?? 0,
          };

          this.hasError = false;
          this.isLoading = false;

          console.log('Practitioner assigned:', this.practitioner);

          console.log('Form populated:', this.form);

          this.changeDetector.detectChanges();
        } catch (error) {
          console.error('Error while processing practitioner response:', error);

          this.practitioner = null;
          this.hasError = true;
          this.isLoading = false;

          this.changeDetector.detectChanges();
        }
      },

      error: (error) => {
        console.error('Practitioner API request failed:', error);

        this.practitioner = null;
        this.hasError = true;
        this.isLoading = false;

        this.changeDetector.detectChanges();
      },
    });
  }

  // ============================================================
  // LOAD SERVICES
  // ============================================================

  private loadServices(): void {
    console.log('Requesting services...');

    this.practitionerService.getServices().subscribe({
      next: (services) => {
        console.log('Services response:', services);

        if (Array.isArray(services)) {
          this.services = services;
        } else {
          console.error('Services response is not an array:', services);

          this.services = [];
        }

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Services API request failed:', error);

        this.services = [];

        this.changeDetector.detectChanges();
      },
    });
  }

  // ============================================================
  // SERVICE CHANGE
  // ============================================================

  onServiceChange(): void {
    const selectedService = this.services.find(
      (service: Service) => service.id === this.form.serviceId,
    );

    this.form.serviceName = selectedService?.name ?? '';
  }

  // ============================================================
  // SAVE CHANGES
  // ============================================================

  saveChanges(): void {
    this.saveError = '';

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!this.form.name.trim()) {
      this.saveError = 'Name is required.';
      return;
    }

    if (!this.form.phone.trim()) {
      this.saveError = 'Phone number is required.';
      return;
    }

    if (!this.form.email.trim()) {
      this.saveError = 'Email address is required.';
      return;
    }

    if (!this.form.serviceId) {
      this.saveError = 'Please select a service.';
      return;
    }

    if (!this.form.education.trim()) {
      this.saveError = 'Education is required.';
      return;
    }

    if (this.form.priority < 1 || this.form.priority > 5) {
      this.saveError = 'Priority must be between 1 and 5.';
      return;
    }

    if (this.form.sharePercentage < 0 || this.form.sharePercentage > 100) {
      this.saveError = 'Share percentage must be between 0 and 100.';
      return;
    }

    // ==========================================================
    // UPDATE REQUEST
    // ==========================================================

    const request: UpdatePractitionerRequest = {
      name: this.form.name.trim(),

      phone: this.form.phone.trim(),

      email: this.form.email.trim(),

      serviceId: this.form.serviceId,

      serviceName: this.form.serviceName,

      education: this.form.education.trim(),

      priority: Number(this.form.priority),

      sharePercentage: Number(this.form.sharePercentage),

      /*
       * Preserve the practitioner's currently assigned areas.
       *
       * Areas are managed separately from this edit page,
       * but areaIds are required by UpdatePractitionerRequest.
       */
      areaIds: this.practitioner?.areas?.map((area) => area.id) ?? [],
    };

    console.log('=================================');
    console.log('UPDATE PRACTITIONER REQUEST');
    console.log('=================================');
    console.log(request);

    this.isSaving = true;

    this.practitionerService.updatePractitioner(this.practitionerId, request).subscribe({
      next: () => {
        console.log('Practitioner updated successfully.');

        this.isSaving = false;

        this.router.navigate(['/practitioners', this.practitionerId]);
      },

      error: (error) => {
        console.error('Failed to update practitioner:', error);

        this.isSaving = false;

        if (error?.error?.message) {
          this.saveError = error.error.message;
        } else {
          this.saveError = 'Failed to update practitioner. Please try again.';
        }

        this.changeDetector.detectChanges();
      },
    });
  }

  // ============================================================
  // RESET PASSWORD
  // ============================================================

  resetPassword(): void {
    this.resetPasswordError = '';
    this.resetPasswordSuccess = '';

    // ==========================================================
    // FRONTEND PERMISSION CHECK
    // ==========================================================

    if (!this.canResetPassword) {
      this.resetPasswordError = 'You do not have permission to reset this practitioner password.';

      return;
    }

    const newPassword = this.passwordForm.newPassword.trim();

    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (!newPassword) {
      this.resetPasswordError = 'New password is required.';

      return;
    }

    if (newPassword.length < 8) {
      this.resetPasswordError = 'Password must be at least 8 characters.';

      return;
    }

    // ==========================================================
    // REQUEST
    // ==========================================================

    const request: ResetPractitionerPasswordRequest = {
      newPassword,
    };

    console.log('=================================');
    console.log('RESET PRACTITIONER PASSWORD');
    console.log('=================================');
    console.log({
      practitionerId: this.practitionerId,
      passwordLength: newPassword.length,
    });

    this.isResettingPassword = true;

    this.practitionerService.resetPractitionerPassword(this.practitionerId, request).subscribe({
      next: () => {
        console.log('Practitioner password reset successfully.');

        this.isResettingPassword = false;

        this.passwordForm.newPassword = '';

        this.showNewPassword = false;

        this.resetPasswordSuccess = 'Practitioner password has been updated successfully.';

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error('Failed to reset practitioner password:', error);

        this.isResettingPassword = false;

        if (error?.error?.message) {
          this.resetPasswordError = error.error.message;
        } else if (error?.status === 403) {
          this.resetPasswordError =
            'You do not have permission to reset this practitioner password.';
        } else {
          this.resetPasswordError = 'Failed to reset practitioner password. Please try again.';
        }

        this.changeDetector.detectChanges();
      },
    });
  }

  // ============================================================
  // TOGGLE PASSWORD VISIBILITY
  // ============================================================

  togglePasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    this.router.navigate(['/practitioners', this.practitionerId]);
  }

  // ============================================================
  // GO BACK
  // ============================================================

  goBack(): void {
    this.cancel();
  }
}
