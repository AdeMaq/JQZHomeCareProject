export interface Practitioner {
  id: string;
  name: string;
  email: string;
  type: number;
  education: string;
  priority: number;
  areas: Area[];
  visitCount: number;
  cancellationCount: number;
}

export interface Area {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  category: number;
  description?: string | null;
}

export interface Package {
  id: string;
  name: string;
  numberOfVisits: number;
  amount: number;
}

export interface CreateVisit {
  patientName: string;
  patientPhone: string;
  locationAddress: string;
  practitionerId: string;
  areaId: string;
  serviceId: string;
  packageId?: string | null;
  scheduledDate: string;
  timeSlot: string;
  amountDue: number;
}
