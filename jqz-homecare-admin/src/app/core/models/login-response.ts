export interface LoginResponse {
  token: string;
  userId: string;
  role: number;
  practitionerId: string | null;
}
