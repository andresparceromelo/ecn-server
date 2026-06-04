import { NotFoundError, ValidationError } from '../../../domain/errors/app-error';
import { AthleteProfileRepository } from '../../../domain/interfaces/athlete-profile.repository';
import { UserRepository } from '../../../domain/interfaces/user.repository';
import { PlanResponseDTO, PlanWeek, PlanDay, PlanExercise } from '../../dto/athletes/plan-response.dto';

interface RMRefs {
  squat: number;
  press: number;
  deadlift: number;
}

export class GeneratePlanUseCase {
  private static readonly VALID_DISCIPLINES = ['WEIGHTLIFTING'];

  constructor(
    private readonly userRepo: UserRepository,
    private readonly profileRepo: AthleteProfileRepository,
  ) {}

  async execute(userId: string, discipline: string): Promise<PlanResponseDTO> {
    if (!GeneratePlanUseCase.VALID_DISCIPLINES.includes(discipline)) {
      throw new ValidationError(`Plan disponible solo para: ${GeneratePlanUseCase.VALID_DISCIPLINES.join(', ')}`);
    }

    const user = await this.userRepo.findById(userId);
    if (!user) { throw new NotFoundError('Usuario'); }

    const profile = await this.profileRepo.findByUserId(userId);
    if (!profile) { throw new NotFoundError('Perfil de atleta. Complete el onboarding primero'); }

    const rm: RMRefs = {
      squat: profile.squat1RM ?? 0,
      press: profile.press1RM ?? 0,
      deadlift: profile.deadlift1RM ?? 0,
    };

    if (!rm.squat || !rm.press || !rm.deadlift) {
      throw new ValidationError('Debe registrar sus 1RM (squat, press, deadlift) para generar un plan');
    }

    const weeks = this.buildPlan(profile.level, rm);

    return {
      athlete: {
        name: user.name,
        level: profile.level,
        experienceMonths: profile.experienceMonths,
      },
      generatedAt: new Date().toISOString(),
      discipline,
      reference1RM: { squat: rm.squat, press: rm.press, deadlift: rm.deadlift },
      weeks,
      progressionNotes: this.getNotes(profile.level),
    };
  }

  private buildPlan(level: string, rm: RMRefs): PlanWeek[] {
    switch (level) {
      case 'BEGINNER': return this.beginnerPlan(rm);
      case 'INTERMEDIATE': return this.intermediatePlan(rm);
      case 'ADVANCED': return this.advancedPlan(rm);
      case 'ELITE': return this.elitePlan(rm);
      default: return this.beginnerPlan(rm);
    }
  }

  /* ─── BEGINNER: Linear Progression ─────────────────── */
  private beginnerPlan(rm: RMRefs): PlanWeek[] {
    const basePct = [0.70, 0.725, 0.75, 0.60];
    return basePct.map((pct, i) => ({
      week: i + 1,
      focus: i < 3 ? 'Progresión Lineal' : 'Descarga Activa',
      days: [
        this.day(1, 'Fuerza de Sentadilla', 'Sentadilla', rm.squat, pct, 3, 5, [
          { n: 'Sentadilla', s: 3, r: 5 },
          { n: 'Prensa de Piernas', s: 3, r: 10 },
          { n: 'Elevación de Talones', s: 3, r: 15 },
          { n: 'Plancha', s: 3, r: '30 seg' },
        ]),
        this.day(2, 'Fuerza de Press', 'Press Plano', rm.press, pct, 3, 5, [
          { n: 'Press Plano', s: 3, r: 5 },
          { n: 'Press Militar', s: 3, r: 8 },
          { n: 'Jalón al Pecho', s: 3, r: 10 },
          { n: 'Curl de Bíceps', s: 3, r: 12 },
        ]),
        this.day(3, 'Fuerza de Peso Muerto', 'Peso Muerto', rm.deadlift, pct, 3, 5, [
          { n: 'Peso Muerto', s: 3, r: 5 },
          { n: 'Remo con Barra', s: 3, r: 8 },
          { n: 'Dominadas', s: 3, r: 'máx' },
          { n: 'Elevación de Piernas', s: 3, r: 12 },
        ]),
      ],
    }));
  }

  /* ─── INTERMEDIATE: 4-Week Block Periodization ──────── */
  private intermediatePlan(rm: RMRefs): PlanWeek[] {
    const blocks: { focus: string; pct: number; sets: number; reps: number }[] = [
      { focus: 'Hipertrofia', pct: 0.65, sets: 4, reps: 10 },
      { focus: 'Fuerza', pct: 0.75, sets: 4, reps: 6 },
      { focus: 'Pico de Fuerza', pct: 0.85, sets: 4, reps: 3 },
      { focus: 'Descarga', pct: 0.60, sets: 3, reps: 5 },
    ];

    return blocks.map((block, i) => ({
      week: i + 1,
      focus: block.focus,
      days: [
        this.day(1, 'Sentadilla', 'Sentadilla', rm.squat, block.pct, block.sets, block.reps, [
          { n: 'Sentadilla', s: block.sets, r: block.reps },
          { n: 'Prensa 45°', s: 3, r: 12 },
          { n: 'Caminata del Granjero', s: 3, r: '30 pasos' },
        ]),
        this.day(2, 'Press Plano + Accesorios', 'Press Plano', rm.press, block.pct, block.sets, block.reps, [
          { n: 'Press Plano', s: block.sets, r: block.reps },
          { n: 'Press Inclinado', s: 3, r: 8 },
          { n: 'Remo en T', s: 3, r: 10 },
          { n: 'Laterales', s: 3, r: 15 },
        ]),
        this.day(3, 'Peso Muerto + Tracción', 'Peso Muerto', rm.deadlift, block.pct, block.sets, block.reps, [
          { n: 'Peso Muerto', s: block.sets, r: block.reps },
          { n: 'Remo Pendlay', s: 3, r: 8 },
          { n: 'Face Pull', s: 3, r: 15 },
          { n: 'Martillo de Antebrazos', s: 3, r: 12 },
        ]),
      ],
    }));
  }

  /* ─── ADVANCED: Block Periodization with Intensity ──── */
  private advancedPlan(rm: RMRefs): PlanWeek[] {
    const blocks: { focus: string; pct: number; sets: number; reps: number }[] = [
      { focus: 'Volumen', pct: 0.70, sets: 5, reps: 8 },
      { focus: 'Intensidad', pct: 0.80, sets: 4, reps: 5 },
      { focus: 'Sobreentrenamiento', pct: 0.90, sets: 3, reps: 3 },
      { focus: 'Descarga Activa', pct: 0.60, sets: 3, reps: 5 },
    ];

    return blocks.map((block, i) => ({
      week: i + 1,
      focus: block.focus,
      days: [
        this.day(1, 'Sentadilla Pesada', 'Sentadilla', rm.squat, block.pct, block.sets, block.reps, [
          { n: 'Sentadilla', s: block.sets, r: block.reps },
          { n: 'Sentadilla Búlgara', s: 3, r: 8 },
          { n: 'Elevación de Talones', s: 4, r: 12 },
        ]),
        this.day(2, 'Press Pesado', 'Press Plano', rm.press, block.pct, block.sets, block.reps, [
          { n: 'Press Plano', s: block.sets, r: block.reps },
          { n: 'Press Inclinado', s: 3, r: 6 },
          { n: 'Jalón al Pecho', s: 4, r: 8 },
          { n: 'Tríceps en Polea', s: 3, r: 12 },
        ]),
        this.day(3, 'Peso Muerto Pesado', 'Peso Muerto', rm.deadlift, block.pct, block.sets, block.reps, [
          { n: 'Peso Muerto', s: block.sets, r: block.reps },
          { n: 'Buenos Días', s: 3, r: 8 },
          { n: 'Remo con Mancuerna', s: 3, r: 10 },
          { n: 'Curl de Bíceps', s: 3, r: 10 },
        ]),
        this.day(4, 'Auxiliar', 'Press Militar', rm.press, block.pct - 0.05, 3, 8, [
          { n: 'Press Militar', s: 3, r: 8 },
          { n: 'Sentadilla Frontal', s: 3, r: 8 },
          { n: 'Dominadas', s: 3, r: 'máx' },
          { n: 'Prensa de Piernas', s: 3, r: 12 },
        ]),
      ],
    }));
  }

  /* ─── ELITE: Daily Undulating Periodization (DUP) ──── */
  private elitePlan(rm: RMRefs): PlanWeek[] {
    const weeks: PlanWeek[] = [];

    for (let w = 0; w < 4; w++) {
      const isDeload = w === 3;
      const days: PlanDay[] = [];

      if (isDeload) {
        days.push(this.day(1, 'Descarga', 'Sentadilla', rm.squat, 0.55, 3, 5, [
          { n: 'Sentadilla', s: 3, r: 5 },
          { n: 'Press Plano', s: 3, r: 5 },
          { n: 'Peso Muerto', s: 3, r: 5 },
        ]));
        days.push(this.day(2, 'Descarga', 'Press Plano', rm.press, 0.55, 3, 5, [
          { n: 'Press Plano', s: 3, r: 5 },
          { n: 'Remo', s: 3, r: 5 },
          { n: 'Plancha', s: 3, r: '30 seg' },
        ]));
      } else {
        const dupVariants: { day: number; name: string; exercise: string; rm: number; pct: number; sets: number; reps: number }[] = [
          { day: 1, name: 'Fuerza Máxima', exercise: 'Sentadilla', rm: rm.squat, pct: 0.80 + w * 0.03, sets: 5, reps: 3 },
          { day: 2, name: 'Hipertrofia', exercise: 'Press Plano', rm: rm.press, pct: 0.70 + w * 0.02, sets: 4, reps: 8 },
          { day: 3, name: 'Potencia', exercise: 'Peso Muerto', rm: rm.deadlift, pct: 0.75 + w * 0.04, sets: 3, reps: 3 },
          { day: 4, name: 'Resistencia', exercise: 'Press Militar', rm: rm.press, pct: 0.65, sets: 3, reps: 12 },
        ];

        for (const v of dupVariants) {
          days.push(this.day(v.day, v.name, v.exercise, v.rm, Math.min(v.pct, 0.93), v.sets, v.reps, [
            { n: v.exercise, s: v.sets, r: v.reps },
            { n: v.name === 'Fuerza Máxima' ? 'Sentadilla Frontal' : 'Sentadilla Búlgara', s: 3, r: 8 },
            { n: v.name === 'Hipertrofia' ? 'Press Inclinado' : 'Jalón al Pecho', s: 3, r: 10 },
            { n: 'Core', s: 3, r: '15 reps' },
          ]));
        }
      }

      weeks.push({
        week: w + 1,
        focus: isDeload ? 'Descarga Activa' : `Semana DUP ${w + 1}`,
        days,
      });
    }

    return weeks;
  }

  /* ─── Helpers ──────────────────────────────────────── */
  private day(
    dayNum: number,
    name: string,
    mainExercise: string,
    oneRM: number,
    intensityPct: number,
    _sets: number,
    _reps: number | string,
    rawExercises: { n: string; s: number; r: number | string }[],
  ): PlanDay {
    const weight = Math.round(oneRM * intensityPct / 2.5) * 2.5;

    const exercises: PlanExercise[] = rawExercises.map((ex) => {
      let exWeight = 0;
      if (ex.n === mainExercise) {
        exWeight = weight;
      } else if (ex.s > 0) {
        const exPct = ex.n.includes('Press') || ex.n.includes('Militar') ? 0.7 * intensityPct
                    : ex.n.includes('Remo') ? 0.6 * intensityPct
                    : ex.n.includes('Dominadas') ? 0
                    : 0.4 * intensityPct;
        exWeight = Math.round(oneRM * exPct / 2.5) * 2.5;
      }

      return {
        name: ex.n,
        sets: ex.s,
        reps: typeof ex.r === 'number' ? ex.r : 0,
        intensityPercent: Math.round((exWeight / (oneRM || 1)) * 100),
        recommendedWeight: exWeight,
      };
    });

    return {
      day: dayNum,
      name,
      focus: `${Math.round(intensityPct * 100)}% 1RM`,
      exercises,
    };
  }

  private getNotes(level: string): string[] {
    const common = [
      'Calentar 10-15 min antes de cada sesión',
      'Descansar 2-3 min entre series pesadas, 60-90 seg en accesorios',
      'Aumentar 2.5kg en ejercicios principales cuando complete todas las repes',
    ];
    const specific: Record<string, string[]> = {
      BEGINNER: [
        'Progresión lineal: suba 2.5kg por sesión si completa todas las series',
        'Semana 4: descarga activa al 60% para recuperación',
        'Priorice técnica sobre peso',
      ],
      INTERMEDIATE: [
        'Periodización por bloques de 4 semanas',
        'Semana 1: hipertrofia (10 reps), Semana 2: fuerza (6 reps), Semana 3: pico (3 reps)',
        'Semana 4: descarga obligatoria al 60%',
      ],
      ADVANCED: [
        'Bloques de volumen → intensidad → sobrecarga → descarga',
        'Semana 3: sobreentrenamiento controlado al 90%',
        'Considerar deload extra si fatiga acumulada',
      ],
      ELITE: [
        'Periodización ondulante diaria (DUP)',
        'Cada día varía: fuerza máxima, hipertrofia, potencia, resistencia',
        'Monitorear RPE (tasa de esfuerzo percibido) cada serie',
        'Ajustar cargas según recuperación diaria',
      ],
    };
    return [...common, ...(specific[level] || [])];
  }
}
