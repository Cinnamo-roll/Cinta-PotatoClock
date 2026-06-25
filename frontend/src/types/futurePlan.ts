export interface FuturePlan {
  id: string | number;
  title: string;
  note?: string;
  targetDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuturePlanInput {
  title: string;
  note?: string;
  targetDate: string;
}
