export interface MonthlyData {
  month: string;
  count: number;
}

export interface DisciplineData {
  discipline: string;
  count: number;
}

export interface AthleteStatsResponseDTO {
  logsByMonth: MonthlyData[];
  logsByDiscipline: DisciplineData[];
  totalLogs: number;
}
