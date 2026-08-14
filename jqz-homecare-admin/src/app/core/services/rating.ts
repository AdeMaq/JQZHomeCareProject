export interface Rating {
  id: string;
  practitionerId: string;
  month: string;
  score: number;
  comments?: string | null;
}

export interface CreateRating {
  month: string;
  score: number;
  comments?: string | null;
}

export interface UpdateRating {
  score: number;
  comments?: string | null;
}
