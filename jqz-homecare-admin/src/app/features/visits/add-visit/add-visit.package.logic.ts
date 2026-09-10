import { Package } from '../../../core/services/package';
import { AddVisitForm, VisitAssignmentForm } from './add-visit.models';

// ============================================================
// PACKAGE LOGIC
// ============================================================

export class AddVisitPackageLogic {
  selectedPackage: Package | null = null;

  // ============================================================
  // CREATE EMPTY ASSIGNMENT
  // ============================================================

  createEmptyAssignment(): VisitAssignmentForm {
    return {
      practitionerId: null,
      areaId: null,
      scheduledDate: null,
      slotStart: null,
      slotEnd: null,
    };
  }

  // ============================================================
  // CREATE ASSIGNMENTS
  // ============================================================

  createAssignments(count: number): VisitAssignmentForm[] {
    if (count <= 0) {
      return [];
    }

    return Array.from({ length: count }, () => this.createEmptyAssignment());
  }

  // ============================================================
  // CLEAR PACKAGE SELECTION
  // ============================================================

  clearPackageSelection(form: AddVisitForm): void {
    this.selectedPackage = null;

    form.packageId = '';
    form.paymentType = 'FullAdvance';
    form.initialAmountPaid = null;
    form.visitAssignments = [];
  }

  // ============================================================
  // PACKAGE CHANGE
  // ============================================================

  onPackageChange(form: AddVisitForm, packages: Package[]): void {
    const packageId = form.packageId?.trim();

    if (!packageId) {
      this.clearPackageSelection(form);
      return;
    }

    this.selectedPackage = packages.find((pkg) => pkg.id === packageId) ?? null;

    if (!this.selectedPackage) {
      form.paymentType = 'FullAdvance';
      form.initialAmountPaid = null;
      form.visitAssignments = [];
      return;
    }

    form.paymentType = 'FullAdvance';
    form.initialAmountPaid = this.selectedPackage.amount;

    form.visitAssignments = this.createAssignments(this.selectedPackage.numberOfVisits);
  }

  // ============================================================
  // PAYMENT TYPE CHANGE
  // ============================================================

  onPaymentTypeChange(form: AddVisitForm, selectedPackage: Package | null): void {
    if (!selectedPackage) {
      form.initialAmountPaid = null;
      return;
    }

    if (form.paymentType === 'FullAdvance') {
      form.initialAmountPaid = selectedPackage.amount;
      return;
    }

    form.initialAmountPaid = null;
  }

  // ============================================================
  // GET PENDING AMOUNT
  // ============================================================

  getPendingAmount(form: AddVisitForm, selectedPackage: Package | null): number {
    if (!selectedPackage) {
      return 0;
    }

    if (form.paymentType === 'FullAdvance') {
      return 0;
    }

    const initialAmount = Number(form.initialAmountPaid ?? 0);

    return Math.max(selectedPackage.amount - initialAmount, 0);
  }

  // ============================================================
  // VALIDATE INSTALLMENT
  // ============================================================

  validateInstallment(form: AddVisitForm, selectedPackage: Package | null): string | null {
    if (!selectedPackage) {
      return 'Please select a package.';
    }

    if (form.paymentType !== 'Installment') {
      return null;
    }

    const initialAmount = Number(form.initialAmountPaid ?? 0);

    if (!Number.isFinite(initialAmount)) {
      return 'Please enter a valid initial payment amount.';
    }

    if (initialAmount <= 0) {
      return 'Initial payment amount must be greater than zero.';
    }

    if (initialAmount >= selectedPackage.amount) {
      return 'Initial installment payment must be less than the total package amount.';
    }

    return null;
  }

  // ============================================================
  // RESET
  // ============================================================

  reset(): void {
    this.selectedPackage = null;
  }
}
