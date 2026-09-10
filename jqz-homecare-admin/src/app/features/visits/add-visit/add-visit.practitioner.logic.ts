import { Area } from '../../../core/services/city-area';
import { Practitioner } from '../../../core/services/practitioner';
import { AddVisitForm, OpenDropdown } from './add-visit.models';
import { Package } from '../../../core/services/package';

// ============================================================
// PRACTITIONER LOGIC
// ============================================================

export class AddVisitPractitionerLogic {
  openDropdown: OpenDropdown = null;

  areaSearchTerms: Record<number, string> = {};
  practitionerSearchTerms: Record<number, string> = {};

  // ============================================================
  // LOAD DATA
  // ============================================================

  setPractitioners(practitioners: Practitioner[]): Practitioner[] {
    return practitioners;
  }

  setAreas(areas: Area[]): Area[] {
    return areas;
  }

  // ============================================================
  // DROPDOWN CONTROL
  // ============================================================

  closeDropdown(): void {
    this.openDropdown = null;
  }

  openAreaDropdown(index: number): void {
    this.openDropdown = {
      type: 'area',
      index,
    };
  }

  openPractitionerDropdown(index: number): void {
    this.openDropdown = {
      type: 'practitioner',
      index,
    };
  }

  isAreaDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'area' && this.openDropdown.index === index;
  }

  isPractitionerDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'practitioner' && this.openDropdown.index === index;
  }

  // ============================================================
  // AREA SEARCH
  // ============================================================

  onAreaSearch(index: number, value: string): void {
    this.areaSearchTerms[index] = value ?? '';
  }

  getFilteredAreas(index: number, areas: Area[]): Area[] {
    const searchTerm = (this.areaSearchTerms[index] ?? '').trim().toLowerCase();

    if (!searchTerm) {
      return areas;
    }

    return areas.filter((area) => area.name.toLowerCase().includes(searchTerm));
  }

  // ============================================================
  // SELECTED AREA
  // ============================================================

  getSelectedAreaName(index: number, form: AddVisitForm, areas: Area[]): string {
    const areaId = form.visitAssignments[index]?.areaId;

    if (!areaId) {
      return 'Select Area';
    }

    return areas.find((area) => area.id === areaId)?.name ?? 'Select Area';
  }

  // ============================================================
  // SELECT AREA
  // ============================================================

  selectArea(index: number, area: Area, form: AddVisitForm, onAreaChanged?: () => void): void {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.areaId = area.id;

    this.areaSearchTerms[index] = '';
    this.closeDropdown();

    onAreaChanged?.();
  }

  // ============================================================
  // PRACTITIONER SEARCH
  // ============================================================

  onPractitionerSearch(index: number, value: string): void {
    this.practitionerSearchTerms[index] = value ?? '';
  }

  // ============================================================
  // SELECTED PRACTITIONER
  // ============================================================

  getSelectedPractitionerName(
    index: number,
    form: AddVisitForm,
    practitioners: Practitioner[],
  ): string {
    const practitionerId = form.visitAssignments[index]?.practitionerId;

    if (!practitionerId) {
      return 'Select Practitioner';
    }

    return (
      practitioners.find((practitioner) => practitioner.id === practitionerId)?.name ??
      'Select Practitioner'
    );
  }

  // ============================================================
  // GET PRACTITIONERS FOR ASSIGNMENT
  // ============================================================

  getPractitionersForAssignment(
    index: number,
    form: AddVisitForm,
    practitioners: Practitioner[],
    selectedPackage: Package | null,
  ): Practitioner[] {
    if (!selectedPackage) {
      return [];
    }

    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return [];
    }

    const selectedAreaId = assignment.areaId;

    const searchTerm = (this.practitionerSearchTerms[index] ?? '').trim().toLowerCase();

    // ------------------------------------------------------------
    // SERVICE FILTER
    // Only practitioners belonging to the package service.
    // ------------------------------------------------------------

    let filtered = practitioners.filter(
      (practitioner) => practitioner.serviceId === selectedPackage.serviceId,
    );

    // ------------------------------------------------------------
    // NAME SEARCH
    // ------------------------------------------------------------

    if (searchTerm) {
      filtered = filtered.filter((practitioner) =>
        practitioner.name.toLowerCase().includes(searchTerm),
      );
    }

    // ------------------------------------------------------------
    // AREA PRIORITY
    //
    // Same service + selected area
    //        ↓
    // Same service + other/no area
    // ------------------------------------------------------------

    if (selectedAreaId) {
      const matchingArea: Practitioner[] = [];
      const otherPractitioners: Practitioner[] = [];

      for (const practitioner of filtered) {
        const worksInSelectedArea =
          practitioner.areas?.some((area) => area.id === selectedAreaId) ?? false;

        if (worksInSelectedArea) {
          matchingArea.push(practitioner);
        } else {
          otherPractitioners.push(practitioner);
        }
      }

      return [...matchingArea, ...otherPractitioners];
    }

    return filtered;
  }

  // ============================================================
  // SELECT PRACTITIONER
  // ============================================================

  selectPractitioner(
    index: number,
    practitioner: Practitioner,
    form: AddVisitForm,
    onPractitionerChanged?: () => void,
  ): void {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.practitionerId = practitioner.id;

    this.practitionerSearchTerms[index] = '';
    this.closeDropdown();

    onPractitionerChanged?.();
  }

  // ============================================================
  // CLEAR SEARCH STATE
  // ============================================================

  resetSearchState(): void {
    this.openDropdown = null;
    this.areaSearchTerms = {};
    this.practitionerSearchTerms = {};
  }

  clearAssignmentSearch(index: number): void {
    delete this.areaSearchTerms[index];
    delete this.practitionerSearchTerms[index];
  }

  // ============================================================
  // AREA CHANGE HELPER
  // ============================================================

  hasAreaChanged(form: AddVisitForm, index: number, previousAreaId: string | null): boolean {
    return form.visitAssignments[index]?.areaId !== previousAreaId;
  }
}
