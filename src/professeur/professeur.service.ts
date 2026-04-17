import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProfesseurMatiere } from '../database/entities/professeur-matiere.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { Matiere } from '../database/entities/matiere.entity';
import { AssignMatiereDto } from './dto/assign-matiere.dto';

export interface ClasseResumee {
  filiereId: string;
  filiere: { id: string; name: string; code: string } | null;
  niveauId: string;
  niveau: { id: string; name: string } | null;
  matieres: Matiere[];
}

@Injectable()
export class ProfesseurService {
  constructor(
    @Inject('PROFESSEUR_MATIERE_REPOSITORY')
    private professeurMatiereRepo: Repository<ProfesseurMatiere>,
    @Inject('USER_REPOSITORY')
    private userRepo: Repository<User>,
    @Inject('MATIERE_REPOSITORY')
    private matiereRepo: Repository<Matiere>,
  ) {}

  // ─── Admin ───────────────────────────────────────────────────────────────────

  /** Assigner une matière à un professeur (admin) */
  async assignMatiere(professeurId: string, dto: AssignMatiereDto): Promise<ProfesseurMatiere> {
    const prof = await this.userRepo.findOne({ where: { id: professeurId } });
    if (!prof) throw new NotFoundException('Professeur non trouvé.');
    if (prof.role !== UserRole.PROFESSEUR) {
      throw new ForbiddenException('Cet utilisateur n\'est pas un professeur.');
    }

    const matiere = await this.matiereRepo.findOne({ where: { id: dto.matiereId } });
    if (!matiere) throw new NotFoundException('Matière non trouvée.');

    const existing = await this.professeurMatiereRepo.findOne({
      where: { professeurId, matiereId: dto.matiereId },
    });
    if (existing) throw new ConflictException('Ce professeur est déjà assigné à cette matière.');

    const record = this.professeurMatiereRepo.create({ professeurId, matiereId: dto.matiereId });
    return this.professeurMatiereRepo.save(record);
  }

  /** Retirer l'affectation d'un professeur à une matière (admin) */
  async removeMatiere(id: string): Promise<void> {
    const record = await this.professeurMatiereRepo.findOne({ where: { id } });
    if (!record) throw new NotFoundException('Affectation non trouvée.');
    await this.professeurMatiereRepo.delete(id);
  }

  /** Lister les affectations matières d'un professeur (admin) */
  async getMatieresOfProfesseur(professeurId: string): Promise<ProfesseurMatiere[]> {
    const prof = await this.userRepo.findOne({ where: { id: professeurId } });
    if (!prof) throw new NotFoundException('Professeur non trouvé.');
    return this.professeurMatiereRepo.find({
      where: { professeurId },
      order: { createdAt: 'ASC' },
    });
  }

  /** Lister tous les professeurs (admin) */
  async getAllProfesseurs(): Promise<User[]> {
    return this.userRepo.find({ where: { role: UserRole.PROFESSEUR } });
  }

  // ─── Professeur connecté ─────────────────────────────────────────────────────

  /** Matières directement assignées au professeur connecté */
  async getMesMatieres(professeurId: string): Promise<Matiere[]> {
    const records = await this.professeurMatiereRepo.find({
      where: { professeurId },
      order: { createdAt: 'ASC' },
    });
    return records.map((r) => r.matiere);
  }

  /**
   * Classes (filière + niveau) déduites des matières assignées.
   * Regroupe les matières par (filiereId, niveauId).
   */
  async getMesClasses(professeurId: string): Promise<ClasseResumee[]> {
    const matieres = await this.getMesMatieres(professeurId);
    const map = new Map<string, ClasseResumee>();

    for (const m of matieres) {
      const key = `${m.filiereId}__${m.niveauId}`;
      if (!map.has(key)) {
        map.set(key, {
          filiereId: m.filiereId,
          filiere: m.filiere
            ? { id: m.filiere.id, name: m.filiere.name, code: m.filiere.code }
            : null,
          niveauId: m.niveauId,
          niveau: m.niveau
            ? { id: m.niveau.id, name: m.niveau.name }
            : null,
          matieres: [],
        });
      }
      map.get(key)!.matieres.push(m);
    }

    return Array.from(map.values());
  }

  // ─── Contrôle d'accès ────────────────────────────────────────────────────────

  /**
   * Vérifie qu'un professeur est bien assigné à la matière concernée.
   * Lève ForbiddenException sinon.
   */
  async verifierAccesMatiere(professeurId: string, matiereId: string): Promise<void> {
    const record = await this.professeurMatiereRepo.findOne({
      where: { professeurId, matiereId },
    });

    if (!record) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à gérer les notes de cette matière.',
      );
    }
  }
}
