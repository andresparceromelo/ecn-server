import { AthleteLevel } from '../enums/athlete-level.enum';

export interface OnboardingData {
  experienceMonths: number;
  heightCm: number;
  weightKg: number;
  bodyFatPercentage?: number;
  squat1RM: number;
  press1RM: number;
  deadlift1RM: number;
}

export const calculateAthleteStatus = (data: OnboardingData) => {
  const bodyFat = data.bodyFatPercentage || 15;
  const heightMeters = data.heightCm / 100;
  
  // 1. Índice de Masa Libre de Grasa (FFMI)
  const leanMassKg = data.weightKg * (1 - bodyFat / 100);
  const ffmiBase = leanMassKg / (heightMeters * heightMeters);
  const ffmiAdjusted = ffmiBase + 6.1 * (1.8 - heightMeters);

  // 2. Coeficiente de Fuerza Relativa (SWR)
  const totalLifted = data.squat1RM + data.press1RM + data.deadlift1RM;
  const swr = totalLifted / data.weightKg;

  // 3. Matriz Ponderada de Categorización (Fuerza 60%, FFMI 25%, Tiempo 15%)
  let score = 0;
  
  // Puntos por Fuerza
  if (swr >= 5.5) { score += 60; }
  else if (swr >= 4.0) { score += 45; }
  else if (swr >= 2.5) { score += 25; }
  else { score += 10; }

  // Puntos por FFMI
  if (ffmiAdjusted >= 23.5) { score += 25; }
  else if (ffmiAdjusted >= 21.5) { score += 18; }
  else if (ffmiAdjusted >= 19.5) { score += 10; }
  else { score += 5; }

  // Puntos por Tiempo
  if (data.experienceMonths >= 60) { score += 15; }
  else if (data.experienceMonths >= 36) { score += 10; }
  else if (data.experienceMonths >= 12) { score += 5; }
  else { score += 2; }

  // Determinación de Categoría final
  let level = AthleteLevel.BEGINNER;
  if (score >= 85) { level = AthleteLevel.ELITE; }
  else if (score >= 65) { level = AthleteLevel.ADVANCED; }
  else if (score >= 35) { level = AthleteLevel.INTERMEDIATE; }

  return {
    level,
    ffmi: Math.round(ffmiAdjusted * 100) / 100,
    swr: Math.round(swr * 100) / 100,
    bodyFat
  };
};
