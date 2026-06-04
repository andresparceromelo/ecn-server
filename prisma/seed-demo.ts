import { PrismaClient, UserRole, AthleteLevel, Discipline } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BASE_DATE = new Date('2026-01-15T00:00:00.000Z');

interface AthleteDef {
  name: string;
  email: string;
  level: AthleteLevel;
  squat1RM: number;
  press1RM: number;
  deadlift1RM: number;
  height: number;
  weight: number;
  bodyFat: number;
  experienceMonths: number;
}

function round2_5(v: number): number {
  return Math.round(v / 2.5) * 2.5;
}

function generateAthletes(): AthleteDef[] {
  const list: AthleteDef[] = [];
  let idx = 0;

  const groups: [number, AthleteLevel, [number,number], [number,number], [number,number], [number,number], [number,number], [number,number], [number,number]][] = [
    [20, AthleteLevel.BEGINNER,       [40,80],    [20,45],   [50,100],  [1.0,1.5],  [1.65,1.80], [12,18],   [1,12]],
    [15, AthleteLevel.INTERMEDIATE,   [82,115],   [42,65],   [105,145], [1.5,2.0],  [1.68,1.83], [10,15],   [13,36]],
    [10, AthleteLevel.ADVANCED,       [120,160],  [62,85],   [150,195], [2.0,2.3],  [1.70,1.85], [8,12],    [37,72]],
    [5,  AthleteLevel.ELITE,          [165,200],  [85,110],  [200,250], [2.3,2.7],  [1.72,1.88], [7,10],    [73,120]],
  ];

  for (const [count, level, sR, pR, dR, swrR, hR, bfR, expR] of groups) {
    for (let i = 0; i < count; i++) {
      const t = i / Math.max(count - 1, 1);
      const squat = round2_5(sR[0] + (sR[1] - sR[0]) * t);
      const press = round2_5(pR[0] + (pR[1] - pR[0]) * t);
      const deadlift = round2_5(dR[0] + (dR[1] - dR[0]) * t);
      const swr = swrR[0] + (swrR[1] - swrR[0]) * t;
      const weight = Math.round(squat / swr);
      const height = hR[0] + (hR[1] - hR[0]) * t;
      const bf = bfR[0] + (bfR[1] - bfR[0]) * (1 - t);
      const exp = Math.round(expR[0] + (expR[1] - expR[0]) * t);
      const num = String(idx + 1).padStart(2, '0');
      list.push({
        name: `${level.charAt(0) + level.slice(1).toLowerCase()} ${num}`,
        email: `atleta${num}@ecn.demo`,
        level,
        squat1RM: squat,
        press1RM: press,
        deadlift1RM: deadlift,
        height: Math.round(height * 100) / 100,
        weight,
        bodyFat: Math.round(bf * 100) / 100,
        experienceMonths: exp,
      });
      idx++;
    }
  }
  return list;
}

function generateLogs(def: AthleteDef): { exerciseName: string; metricValue: number; reps: number; loggedAt: Date }[] {
  const results: { exerciseName: string; metricValue: number; reps: number; loggedAt: Date }[] = [];
  const { squat1RM, press1RM, deadlift1RM, level } = def;

  const sessions = [
    { day: 7,  pct: level === AthleteLevel.BEGINNER ? 0.65 : level === AthleteLevel.ELITE ? 0.70 : 0.67 },
    { day: 28, pct: level === AthleteLevel.BEGINNER ? 0.72 : level === AthleteLevel.ELITE ? 0.78 : 0.75 },
    { day: 49, pct: level === AthleteLevel.BEGINNER ? 0.78 : level === AthleteLevel.ELITE ? 0.85 : 0.82 },
  ];

  for (const s of sessions) {
    const d1 = new Date(BASE_DATE);
    d1.setDate(d1.getDate() + s.day);
    results.push({ exerciseName: 'Sentadilla', metricValue: round2_5(squat1RM * s.pct), reps: 5, loggedAt: d1 });

    const d2 = new Date(BASE_DATE);
    d2.setDate(d2.getDate() + s.day + 1);
    results.push({ exerciseName: 'Press Plano', metricValue: round2_5(press1RM * s.pct), reps: 5, loggedAt: d2 });

    const d3 = new Date(BASE_DATE);
    d3.setDate(d3.getDate() + s.day + 2);
    results.push({ exerciseName: 'Peso Muerto', metricValue: round2_5(deadlift1RM * s.pct * 0.95), reps: 3, loggedAt: d3 });
  }

  return results;
}

async function main(): Promise<void> {
  const existing = await prisma.user.findMany({ where: { email: { endsWith: '@ecn.demo' } }, take: 1 });
  if (existing.length > 0) {
    console.log('ℹ️  Los datos demo ya existen. Use "npx prisma migrate reset --force" para reiniciar.');
    return;
  }

  const password = await bcrypt.hash('demo123', 10);
  const athletes = generateAthletes();
  console.log(`🧑‍🏫 Creando ${athletes.length} atletas demo...`);
  let totalLogs = 0;

  for (const def of athletes) {
    const user = await prisma.user.create({
      data: { name: def.name, email: def.email, password, role: UserRole.ATHLETE },
    });

    const ffmi = (def.weight * (1 - def.bodyFat / 100)) / (def.height * def.height);
    const swr = def.squat1RM / def.weight;

    await prisma.athleteProfile.create({
      data: {
        userId: user.id,
        level: def.level,
        experienceMonths: def.experienceMonths,
        height: def.height,
        weight: def.weight,
        bodyFat: def.bodyFat,
        ffmi: Math.round(ffmi * 100) / 100,
        swr: Math.round(swr * 100) / 100,
        squat1RM: def.squat1RM,
        press1RM: def.press1RM,
        deadlift1RM: def.deadlift1RM,
      },
    });

    const logs = generateLogs(def);
    for (const log of logs) {
      await prisma.performanceLog.create({
        data: {
          athleteId: user.id,
          discipline: Discipline.WEIGHTLIFTING,
          exerciseName: log.exerciseName,
          metricValue: log.metricValue,
          reps: log.reps,
          loggedAt: log.loggedAt,
        },
      });
      totalLogs++;
    }
  }

  console.log(`✅ ${athletes.length} atletas creados con ${totalLogs} registros de rendimiento`);
  console.log('🔑 Contraseña para todos los atletas: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed-demo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
