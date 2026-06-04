export interface PlanExercise {
  name: string;
  sets: number;
  reps: number;
  intensityPercent: number;
  recommendedWeight: number;
}

export interface PlanDay {
  day: number;
  name: string;
  focus: string;
  exercises: PlanExercise[];
}

export interface PlanWeek {
  week: number;
  focus: string;
  days: PlanDay[];
}

export interface PlanResponseDTO {
  athlete: {
    name: string;
    level: string;
    experienceMonths: number | null;
  };
  generatedAt: string;
  discipline: string;
  reference1RM: {
    squat: number | null;
    press: number | null;
    deadlift: number | null;
  };
  weeks: PlanWeek[];
  progressionNotes: string[];
}
