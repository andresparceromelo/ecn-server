export interface ProfileResponseDTO {
  id: string;
  level: string;
  experienceMonths: number | null;
  height: number | null;
  weight: number | null;
  bodyFat: number | null;
  ffmi: number | null;
  swr: number | null;
  squat1RM: number | null;
  press1RM: number | null;
  deadlift1RM: number | null;
  hasProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExistingProfileResponseDTO {
  hasProfile: false;
  profile: null;
}
