export interface DisciplineData {
  discipline: string;
  count: number;
}

export interface MonthlyData {
  month: string;
  count: number;
}

export interface LevelData {
  level: string;
  count: number;
}

export interface RoleData {
  role: string;
  count: number;
}

export interface ChartsResponseDTO {
  logsByDiscipline: DisciplineData[];
  logsByMonth: MonthlyData[];
  athletesByLevel: LevelData[];
  usersByRole: RoleData[];
}
