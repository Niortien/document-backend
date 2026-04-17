import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { NoteEtudiant, StatutNote } from '../database/entities/note-etudiant.entity';
import { Matiere } from '../database/entities/matiere.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { SaisirSessionDto } from './dto/saisir-session.dto';

/** Résultat agrégé d'un module complémentaire (ex: Mathématiques 1) */
export interface ResultatModule {
  module: Matiere;
  notes: NoteEtudiant[];
  moyenneModule: number | null;
  statut: 'valide' | 'en_cours' | 'en_session' | 'ajourne';
}

/** Bulletin complet d'un étudiant pour une année académique */
export interface BulletinEtudiant {
  etudiantId: string;
  anneeAcademique: string;
  notesMatiereSimple: NoteEtudiant[];
  modulesComplementaires: ResultatModule[];
  moyenneGenerale: number | null;
}

@Injectable()
export class NotesService {
  constructor(
    @Inject('NOTE_REPOSITORY')
    private noteRepository: Repository<NoteEtudiant>,
    @Inject('MATIERE_REPOSITORY')
    private matiereRepository: Repository<Matiere>,
  ) {}

  // ─── Calculs internes ───────────────────────────────────────────────────────

  /** Calcule la moyenne matière : classe * 0.4 + examen * 0.6 */
  private calculerMoyenneMatiere(
    moyenneClasse: number | null,
    moyenneExamen: number | null,
  ): number | null {
    if (moyenneClasse == null || moyenneExamen == null) return null;
    return Math.round((moyenneClasse * 0.4 + moyenneExamen * 0.6) * 100) / 100;
  }

  /** Détermine le statut à partir de la moyenne */
  private determinerStatut(
    moyenne: number | null,
    sessionFaite: boolean,
    moyenneSession: number | null,
  ): StatutNote {
    if (moyenne == null) return StatutNote.EN_COURS;
    if (moyenne >= 10) return StatutNote.VALIDE;
    // < 10 : session
    if (!sessionFaite || moyenneSession == null) return StatutNote.EN_SESSION;
    return moyenneSession >= 10 ? StatutNote.VALIDE : StatutNote.AJOURNE;
  }

  // ─── CRUD notes ─────────────────────────────────────────────────────────────

  async create(dto: CreateNoteDto): Promise<NoteEtudiant> {
    // Vérifier que la matière existe et que ce n'est pas un module parent
    const matiere = await this.matiereRepository.findOne({ where: { id: dto.matiereId } });
    if (!matiere) throw new NotFoundException('Matière non trouvée');
    if (matiere.isModule) {
      throw new BadRequestException(
        'Impossible de saisir des notes directement sur un module complémentaire. Saisissez les notes sur ses sous-matières.',
      );
    }

    // Vérifier l'unicité
    const existing = await this.noteRepository.findOne({
      where: { etudiantId: dto.etudiantId, matiereId: dto.matiereId, anneeAcademique: dto.anneeAcademique },
    });
    if (existing) {
      throw new ConflictException('Une note existe déjà pour cet étudiant dans cette matière et cette année académique.');
    }

    const moyenneMatiere = this.calculerMoyenneMatiere(dto.moyenneClasse ?? null, dto.moyenneExamen ?? null);
    const statut = this.determinerStatut(moyenneMatiere, false, null);

    const note = this.noteRepository.create({
      etudiantId: dto.etudiantId,
      matiereId: dto.matiereId,
      anneeAcademique: dto.anneeAcademique,
      moyenneClasse: dto.moyenneClasse ?? null,
      moyenneExamen: dto.moyenneExamen ?? null,
      moyenneMatiere,
      statut,
      moyenneSession: null,
    });

    return this.noteRepository.save(note);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<NoteEtudiant> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note non trouvée');

    const moyenneClasse = dto.moyenneClasse !== undefined ? dto.moyenneClasse : note.moyenneClasse;
    const moyenneExamen = dto.moyenneExamen !== undefined ? dto.moyenneExamen : note.moyenneExamen;
    const moyenneMatiere = this.calculerMoyenneMatiere(moyenneClasse, moyenneExamen);

    // Recalculer le statut — on conserve la note de session si elle existe
    const statut = this.determinerStatut(
      moyenneMatiere,
      note.moyenneSession != null,
      note.moyenneSession,
    );

    await this.noteRepository.update(id, {
      moyenneClasse,
      moyenneExamen,
      moyenneMatiere,
      statut,
    });

    return this.noteRepository.findOne({ where: { id } }) as Promise<NoteEtudiant>;
  }

  async saisirSession(id: string, dto: SaisirSessionDto): Promise<NoteEtudiant> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note non trouvée');
    if (note.statut !== StatutNote.EN_SESSION) {
      throw new BadRequestException(
        `Cet étudiant n'est pas en session pour cette matière (statut actuel : ${note.statut}).`,
      );
    }

    const statut = dto.moyenneSession >= 10 ? StatutNote.VALIDE : StatutNote.AJOURNE;

    await this.noteRepository.update(id, {
      moyenneSession: dto.moyenneSession,
      statut,
    });

    return this.noteRepository.findOne({ where: { id } }) as Promise<NoteEtudiant>;
  }

  findOne(id: string): Promise<NoteEtudiant | null> {
    return this.noteRepository.findOne({
      where: { id },
      relations: ['etudiant', 'matiere'],
    });
  }

  /** Toutes les notes d'un étudiant pour une année académique */
  findByEtudiant(etudiantId: string, anneeAcademique: string): Promise<NoteEtudiant[]> {
    return this.noteRepository.find({
      where: { etudiantId, anneeAcademique },
      relations: ['matiere'],
      order: { createdAt: 'ASC' },
    });
  }

  /** Toutes les notes d'une matière pour une année académique (vue admin/prof) */
  findByMatiere(matiereId: string, anneeAcademique: string): Promise<NoteEtudiant[]> {
    return this.noteRepository.find({
      where: { matiereId, anneeAcademique },
      relations: ['etudiant', 'matiere'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) throw new NotFoundException('Note non trouvée');
    await this.noteRepository.delete(id);
  }

  // ─── Bulletin ───────────────────────────────────────────────────────────────

  async getBulletin(etudiantId: string, anneeAcademique: string): Promise<BulletinEtudiant> {
    // Toutes les notes de l'étudiant
    const notes = await this.noteRepository.find({
      where: { etudiantId, anneeAcademique },
      relations: ['matiere', 'matiere.parent'],
    });

    // Récupérer toutes les matières impliquées avec leurs relations parent/enfants
    const matiereIds = [...new Set(notes.map((n) => n.matiereId))];
    const matieres = await this.matiereRepository.findByIds(matiereIds);

    // Séparer les matières simples (sans parent) et les sous-matières de modules
    const notesMatiereSimple: NoteEtudiant[] = [];
    const notesSousMatiere: NoteEtudiant[] = [];

    for (const note of notes) {
      if (note.matiere.parentId) {
        notesSousMatiere.push(note);
      } else {
        notesMatiereSimple.push(note);
      }
    }

    // Grouper les sous-matières par module parent
    const groupesParModule = new Map<string, NoteEtudiant[]>();
    for (const note of notesSousMatiere) {
      const parentId = note.matiere.parentId!;
      if (!groupesParModule.has(parentId)) groupesParModule.set(parentId, []);
      groupesParModule.get(parentId)!.push(note);
    }

    // Calculer les résultats par module
    const modulesComplementaires: ResultatModule[] = [];
    for (const [parentId, notesModule] of groupesParModule.entries()) {
      const moduleMat = await this.matiereRepository.findOne({
        where: { id: parentId },
        relations: ['children'],
      });
      if (!moduleMat) continue;

      const { moyenne, statut } = this.calculerResultatModule(notesModule, moduleMat);
      modulesComplementaires.push({
        module: moduleMat,
        notes: notesModule,
        moyenneModule: moyenne,
        statut,
      });
    }

    // Moyenne générale pondérée par coefficient (matières simples + modules)
    const moyenneGenerale = this.calculerMoyenneGenerale(notesMatiereSimple, modulesComplementaires);

    return {
      etudiantId,
      anneeAcademique,
      notesMatiereSimple,
      modulesComplementaires,
      moyenneGenerale,
    };
  }

  /**
   * Calcule la moyenne d'un module complémentaire à partir des notes des sous-matières.
   * Ex: Algèbre 1 (coeff 3, moy 5) + Analyse 1 (coeff 3, moy 15)
   *   → moyenne module = (5*3 + 15*3) / (3+3) = 10 → validé
   */
  private calculerResultatModule(
    notes: NoteEtudiant[],
    moduleMat: Matiere,
  ): { moyenne: number | null; statut: 'valide' | 'en_cours' | 'en_session' | 'ajourne' } {
    const notesAvecMoyenne = notes.filter((n) => n.moyenneMatiere != null || n.moyenneSession != null);

    if (notesAvecMoyenne.length === 0) return { moyenne: null, statut: 'en_cours' };

    // Utiliser la note finale (session si disponible et > note initiale, sinon moyenneMatiere)
    let totalPondere = 0;
    let totalCoeff = 0;
    let toutesCompletes = true;

    for (const note of notes) {
      const notefinale = this.getNoteFinale(note);
      if (notefinale == null) { toutesCompletes = false; continue; }
      const coeff = Number(note.matiere.coefficient) || 1;
      totalPondere += notefinale * coeff;
      totalCoeff += coeff;
    }

    if (totalCoeff === 0) return { moyenne: null, statut: 'en_cours' };
    if (!toutesCompletes) return { moyenne: null, statut: 'en_cours' };

    const moyenne = Math.round((totalPondere / totalCoeff) * 100) / 100;

    // Déterminer le statut global du module
    const tousEnSession = notes.every(
      (n) => n.statut === StatutNote.EN_SESSION || n.statut === StatutNote.AJOURNE || n.statut === StatutNote.VALIDE,
    );

    if (moyenne >= 10) return { moyenne, statut: 'valide' };

    // Si certains ont passé la session et la moyenne du module est encore < 10
    const sessionTerminee = notes.some(
      (n) => n.moyenneSession != null,
    );
    if (sessionTerminee) return { moyenne, statut: 'ajourne' };

    return { moyenne, statut: 'en_session' };
  }

  /** Retourne la note finale à utiliser pour un étudiant dans une matière */
  private getNoteFinale(note: NoteEtudiant): number | null {
    if (note.moyenneSession != null) return note.moyenneSession;
    return note.moyenneMatiere;
  }

  /** Calcule la moyenne générale pondérée */
  private calculerMoyenneGenerale(
    notesMatiereSimple: NoteEtudiant[],
    modules: ResultatModule[],
  ): number | null {
    let totalPondere = 0;
    let totalCoeff = 0;

    for (const note of notesMatiereSimple) {
      const notefinale = this.getNoteFinale(note);
      if (notefinale == null) return null; // bulletin incomplet
      const coeff = Number(note.matiere.coefficient) || 1;
      totalPondere += notefinale * coeff;
      totalCoeff += coeff;
    }

    for (const mod of modules) {
      if (mod.moyenneModule == null) return null; // bulletin incomplet
      const coeff = Number(mod.module.coefficient) || 1;
      totalPondere += mod.moyenneModule * coeff;
      totalCoeff += coeff;
    }

    if (totalCoeff === 0) return null;
    return Math.round((totalPondere / totalCoeff) * 100) / 100;
  }
}
