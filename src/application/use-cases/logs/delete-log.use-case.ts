import { ForbiddenError, NotFoundError } from '../../../domain/errors/app-error';
import { PerformanceLogRepository } from '../../../domain/interfaces/performance-log.repository';

export class DeleteLogUseCase {
  constructor(private readonly logRepo: PerformanceLogRepository) {}

  async execute(id: string, athleteId: string): Promise<void> {
    const existing = await this.logRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('Registro de entrenamiento');
    }
    if (existing.athleteId !== athleteId) {
      throw new ForbiddenError('No tienes permiso para eliminar este registro');
    }
    await this.logRepo.delete(id);
  }
}
