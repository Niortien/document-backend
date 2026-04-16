import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Niveau } from '../database/entities/niveau.entity';
import { ScolariteEtudiant } from '../database/entities/scolarite-etudiant.entity';
import { TransportAbonnement } from '../database/entities/transport-abonnement.entity';

@Injectable()
export class AdminService {
  constructor(
    @Inject('ADMIN_USER_REPOSITORY')
    private readonly userRepo: Repository<User>,
    @Inject('ADMIN_NIVEAU_REPOSITORY')
    private readonly niveauRepo: Repository<Niveau>,
    @Inject('ADMIN_SCOLARITE_ETUDIANT_REPOSITORY')
    private readonly scolariteEtudiantRepo: Repository<ScolariteEtudiant>,
    @Inject('ADMIN_TRANSPORT_ABONNEMENT_REPOSITORY')
    private readonly transportAbonnementRepo: Repository<TransportAbonnement>,
  ) {}

  private sanitize(user: User) {
    const { password: _pw, ...safe } = user as any;
    return safe;
  }

  // GET /admin/niveaux
  async getNiveauxGroupes() {
    const niveaux = await this.niveauRepo.find({ order: { name: 'ASC' } });
    const groupMap = new Map<string, Niveau[]>();
    for (const n of niveaux) {
      if (!groupMap.has(n.name)) groupMap.set(n.name, []);
      groupMap.get(n.name)!.push(n);
    }
    const result = await Promise.all(
      Array.from(groupMap.entries()).map(async ([niveauName, list]) => {
        const ids = list.map((n) => n.id);
        const nbEtudiants = await this.userRepo
          .createQueryBuilder('u')
          .where('u.niveauId IN (:...ids)', { ids })
          .getCount();
        return {
          niveauName,
          nbFilieres: list.length,
          nbEtudiants,
          niveaux: list.map((n) => ({ id: n.id, filiereId: n.filiereId, filiere: n.filiere })),
        };
      }),
    );
    return result.filter((g) => g.nbEtudiants > 0);
  }

  // GET /admin/niveaux/:niveauName/filieres
  async getFilieresByNiveauName(niveauName: string) {
    const niveaux = await this.niveauRepo.find({ where: { name: niveauName } });
    if (!niveaux.length) return [];
    const result = await Promise.all(
      niveaux.map(async (niveau) => {
        const nbEtudiants = await this.userRepo.count({ where: { niveauId: niveau.id } });
        return { filiere: niveau.filiere, niveauId: niveau.id, nbEtudiants };
      }),
    );
    return result.filter((r) => r.nbEtudiants > 0);
  }

  // GET /admin/niveaux/:niveauId/overview
  async getOverview(niveauId: string) {
    const niveau = await this.niveauRepo.findOne({ where: { id: niveauId } });
    if (!niveau) throw new NotFoundException(`Niveau introuvable`);
    const etudiants = await this.userRepo.find({ where: { niveauId } });
    const userIds = etudiants.map((u) => u.id);
    if (!userIds.length) {
      return {
        niveau: { id: niveau.id, name: niveau.name, filiereId: niveau.filiereId, filiere: niveau.filiere },
        scolarite: { total: 0, soldes: 0, enCours: 0, enRetard: 0, montantTotalDu: 0, montantTotalPaye: 0, montantRestant: 0 },
        transport: { totalAbonnes: 0, abonnementsSoldes: 0, abonnementsActifs: 0, montantTotalDu: 0, montantTotalPaye: 0, montantRestant: 0 },
      };
    }
    const [scolarites, abonnements] = await Promise.all([
      this.scolariteEtudiantRepo.createQueryBuilder('s').where('s.userId IN (:...userIds)', { userIds }).getMany(),
      this.transportAbonnementRepo.createQueryBuilder('t').where('t.userId IN (:...userIds)', { userIds }).getMany(),
    ]);
    const sDu = scolarites.reduce((acc, s) => acc + Number(s.montantTotal), 0);
    const sPaye = scolarites.reduce((acc, s) => acc + Number(s.montantPaye), 0);
    const tDu = abonnements.reduce((acc, a) => acc + Number(a.montantTotal), 0);
    const tPaye = abonnements.reduce((acc, a) => acc + Number(a.montantPaye), 0);
    return {
      niveau: { id: niveau.id, name: niveau.name, filiereId: niveau.filiereId, filiere: niveau.filiere },
      scolarite: {
        total: scolarites.length,
        soldes: scolarites.filter((s) => s.statut === 'solde').length,
        enCours: scolarites.filter((s) => s.statut === 'en_cours').length,
        enRetard: scolarites.filter((s) => s.statut === 'en_retard').length,
        montantTotalDu: sDu,
        montantTotalPaye: sPaye,
        montantRestant: sDu - sPaye,
      },
      transport: {
        totalAbonnes: abonnements.length,
        abonnementsSoldes: abonnements.filter((a) => a.statut === 'solde').length,
        abonnementsActifs: abonnements.filter((a) => a.statut === 'actif').length,
        montantTotalDu: tDu,
        montantTotalPaye: tPaye,
        montantRestant: tDu - tPaye,
      },
    };
  }

  // GET /admin/niveaux/:niveauId/etudiants
  async getEtudiants(niveauId: string) {
    const niveau = await this.niveauRepo.findOne({ where: { id: niveauId } });
    if (!niveau) throw new NotFoundException(`Niveau introuvable`);
    const rawEtudiants = await this.userRepo.find({
      where: { niveauId },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
    return Promise.all(
      rawEtudiants.map(async (raw) => {
        const etudiant = this.sanitize(raw);
        const scolarites = await this.scolariteEtudiantRepo.find({
          where: { userId: etudiant.id },
          order: { anneeAcademique: 'DESC' },
        });
        const sc = scolarites[0] ?? null;
        const scolarite = sc
          ? { id: sc.id, montantTotal: Number(sc.montantTotal), montantPaye: Number(sc.montantPaye), statut: sc.statut, anneeAcademique: sc.anneeAcademique }
          : null;
        const abonnements = await this.transportAbonnementRepo.find({
          where: { userId: etudiant.id },
          order: { anneeAcademique: 'DESC' },
        });
        const transport = abonnements.map((a) => ({
          id: a.id,
          montantTotal: Number(a.montantTotal),
          montantPaye: Number(a.montantPaye),
          statut: a.statut,
          anneeAcademique: a.anneeAcademique,
          typeAbonnement: a.typeAbonnement,
        }));
        return { etudiant, scolarite, transport };
      }),
    );
  }
}
