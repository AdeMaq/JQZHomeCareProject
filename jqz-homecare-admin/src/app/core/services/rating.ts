export interface Rating {
  id: string;

  practitionerId: string;

  month: number;

  score: number;

  comments?: string | null;
}

export interface CreateRating {
  month: number;

  score: number;

  comments?: string | null;
}

export interface UpdateRating {
  score: number;

  comments?: string | null;
}
