import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ScolariteConfig } from '../database/entities/scolarite-config.entity';
import { ScolariteEtudiant, ScolariteStatut } from '../database/entities/scolarite-etudiant.entity';
import { VersementScolarite } from '../database/entities/versement-scolarite.entity';
import { EcheancierScolarite } from '../database/entities/echeancier-scolarite.entity';
import { EcheanceEtudiant, EcheanceStatut } from '../database/entities/echeance-etudiant.entity';
import { CreateScolariteConfigDto } from './dto/create-scolarite-config.dto';
import { UpdateScolariteConfigDto } from './dto/update-scolarite-config.dto';
import { CreateScolariteEtudiantDto } from './dto/create-scolarite-etudiant.dto';
import { CreateVersementScolariteDto } from './dto/create-versement-scolarite.dto';
import { CreateEcheancierScolariteDto } from './dto/create-echeancier-scolarite.dto';

@Injectable()
export class ScolariteService {
  constructor(
    @Inject('SCOLARITE_CONFIG_REPOSITORY')
    private readonly scolariteConfigRepo: Repository<ScolariteConfig>,
    @Inject('SCOLARITE_ETUDIANT_REPOSITORY')
    private readonly scolariteEtudiantRepo: Repository<ScolariteEtudiant>,
    @Inject('VERSEMENT_SCOLARITE_REPOSITORY')
    private readonly versementRepo: Repository<VersementScolarite>,
    @Inject('ECHEANCIER_SCOLARITE_REPOSITORY')
    private readonly echeancierRepo: Repository<EcheancierScolarite>,
    @Inject('ECHEANCE_ETUDIANT_REPOSITORY')
    private readonly echeanceEtudiantRepo: Repository<EcheanceEtudiant>,
  ) {}

  // ─── ScolariteConfig ────────────────────────────────────────────────────────

  async findAllConfigs(): Promise<ScolariteConfig[]> {
    return this.scolariteConfigRepo.find({ order: { anneeAcademique: 'DESC', createdAt: 'DESC' } });
  }

  async findOneConfig(id: string): Promise<ScolariteConfig> {
    const config = await this.scolariteConfigRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Configuration scolarité introuvable (id: ${id})`);
    return config;
  }

  async createConfig(dto: CreateScolariteConfigDto): Promise<ScolariteConfig> {
    const config = this.scolariteConfigRepo.create({ ...dto, isActive: dto.isActive ?? true });
    return this.scolariteConfigRepo.save(config);
  }

  async updateConfig(id: string, dto: UpdateScolariteConfigDto): Promise<ScolariteConfig> {
    await this.findOneConfig(id);
    await this.scolariteConfigRepo.update(id, dto);
    return this.findOneConfig(id);
  }

  async removeConfig(id: string): Promise<void> {
    await this.findOneConfig(id);
    await this.scolariteConfigRepo.delete(id);
  }

  // ─── Écheancier (plan de paiement par config) ────────────────────────────────

  async findEcheancierByConfig(scolariteConfigId: string): Promise<EcheancierScolarite[]> {
    return this.echeancierRepo.find({
      where: { scolariteConfigId },
      order: { numero: 'ASC' },
    });
  }

  async findOneEcheancier(id: string): Promise<EcheancierScolarite> {
    const item = await this.echeancierRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Échéancier introuvable (id: ${id})`);
    return item;
  }

  async createEcheancier(dto: CreateEcheancierScolariteDto): Promise<EcheancierScolarite> {
    await this.findOneConfig(dto.scolariteConfigId);

    const existing = await this.echeancierRepo.findOne({
      where: { scolariteConfigId: dto.scolariteConfigId, numero: dto.numero },
    });
    if (existing) {
      throw new BadRequestException(
        `Une échéance numéro ${dto.numero} existe déjà pour cette configuration`,
      );
    }

    const echeancier = this.echeancierRepo.create({
      ...dto,
      dateEcheance: new Date(dto.dateEcheance),
      estInscription: dto.estInscription ?? false,
      notes: dto.notes ?? null,
    });
    return this.echeancierRepo.save(echeancier);
  }

  async removeEcheancier(id: string): Promise<void> {
    await this.findOneEcheancier(id);
    await this.echeancierRepo.delete(id);
  }

  // ─── ScolariteEtudiant ──────────────────────────────────────────────────────

  async findAllEtudiants(): Promise<ScolariteEtudiant[]> {
    return this.scolariteEtudiantRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneEtudiant(id: string): Promise<ScolariteEtudiant> {
    const item = await this.scolariteEtudiantRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Scolarité étudiant introuvable (id: ${id})`);
    return item;
  }

  async findByUser(userId: string): Promise<ScolariteEtudiant[]> {
    return this.scolariteEtudiantRepo.find({ where: { userId }, order: { anneeAcademique: 'DESC' } });
  }

  async createEtudiant(dto: CreateScolariteEtudiantDto): Promise<ScolariteEtudiant> {
    const config = await this.findOneConfig(dto.scolariteConfigId);

    const existing = await this.scolariteEtudiantRepo.findOne({
      where: { userId: dto.userId, anneeAcademique: config.anneeAcademique },
    });
    if (existing) {
      throw new BadRequestException(
        `Cet étudiant a déjà une scolarité enregistrée pour l'année ${config.anneeAcademique}`,
      );
    }

    const etudiant = await this.scolariteEtudiantRepo.save(
      this.scolariteEtudiantRepo.create({
        userId: dto.userId,
        scolariteConfigId: dto.scolariteConfigId,
        anneeAcademique: config.anneeAcademique,
        montantTotal: config.montantTotal,
        montantPaye: 0,
        statut: ScolariteStatut.EN_COURS,
        notes: dto.notes ?? null,
      }),
    );

    // Auto-génération des échéances depuis le plan de la config
    const echeancierItems = await this.echeancierRepo.find({
      where: { scolariteConfigId: config.id },
      order: { numero: 'ASC' },
    });

    for (const item of echeancierItems) {
      await this.echeanceEtudiantRepo.save(
        this.echeanceEtudiantRepo.create({
          scolariteEtudiantId: etudiant.id,
          userId: dto.userId,
          echeancierScolariteId: item.id,
          numero: item.numero,
          libelle: item.libelle,
          montantDu: item.montant,
          montantPaye: 0,
          dateLimite: item.dateEcheance,
          statut: EcheanceStatut.EN_ATTENTE,
          notes: null,
        }),
      );
    }

    return etudiant;
  }

  async removeEtudiant(id: string): Promise<void> {
    await this.findOneEtudiant(id);
    await this.scolariteEtudiantRepo.delete(id);
  }

  // ─── Échéances étudiant ──────────────────────────────────────────────────────

  async findEcheancesByEtudiant(scolariteEtudiantId: string): Promise<EcheanceEtudiant[]> {
    return this.echeanceEtudiantRepo.find({
      where: { scolariteEtudiantId },
      order: { numero: 'ASC' },
    });
  }

  async findEcheancesByUser(userId: string): Promise<EcheanceEtudiant[]> {
    return this.echeanceEtudiantRepo.find({
      where: { userId },
      order: { dateLimite: 'ASC' },
    });
  }

  // ─── Versements ─────────────────────────────────────────────────────────────

  async findVersementsByEtudiant(scolariteEtudiantId: string): Promise<VersementScolarite[]> {
    return this.versementRepo.find({
      where: { scolariteEtudiantId },
      order: { datePaiement: 'DESC' },
    });
  }

  async findVersementsByUser(userId: string): Promise<VersementScolarite[]> {
    return this.versementRepo.find({
      where: { userId },
      order: { datePaiement: 'DESC' },
    });
  }

  async createVersement(dto: CreateVersementScolariteDto): Promise<{
    versement: VersementScolarite;
    scolarite: ScolariteEtudiant;
    echeance: EcheanceEtudiant | null;
  }> {
    const scolarite = await this.findOneEtudiant(dto.scolariteEtudiantId);

    const montantPaye = Number(scolarite.montantPaye) + Number(dto.montant);
    const montantTotal = Number(scolarite.montantTotal);

    if (montantPaye > montantTotal) {
      throw new BadRequestException(
        `Le montant versé (${dto.montant}) dépasse le restant à payer (${montantTotal - Number(scolarite.montantPaye)})`,
      );
    }

    // Validation de l'échéance ciblée si fournie
    let echeance: EcheanceEtudiant | null = null;
    if (dto.echeanceEtudiantId) {
      echeance = await this.echeanceEtudiantRepo.findOne({ where: { id: dto.echeanceEtudiantId } });
      if (!echeance) {
        throw new NotFoundException(`Échéance introuvable (id: ${dto.echeanceEtudiantId})`);
      }
      if (echeance.scolariteEtudiantId !== scolarite.id) {
        throw new BadRequestException(`Cette échéance n'appartient pas à la scolarité de cet étudiant`);
      }
      const echeanceMontantPaye = Number(echeance.montantPaye) + Number(dto.montant);
      if (echeanceMontantPaye > Number(echeance.montantDu)) {
        throw new BadRequestException(
          `Le montant versé (${dto.montant}) dépasse le restant dû pour cette échéance (${Number(echeance.montantDu) - Number(echeance.montantPaye)})`,
        );
      }
    }

    // Enregistrement du versement
    const versement = await this.versementRepo.save(
      this.versementRepo.create({
        scolariteEtudiantId: dto.scolariteEtudiantId,
        userId: scolarite.userId,
        montant: dto.montant,
        datePaiement: new Date(dto.datePaiement),
        motif: dto.motif ?? null,
        echeanceEtudiantId: dto.echeanceEtudiantId ?? null,
      }),
    );

    // Mise à jour de l'échéance ciblée
    if (echeance) {
      const echeanceMontantPaye = Number(echeance.montantPaye) + Number(dto.montant);
      let newEcheanceStatut: EcheanceStatut;
      if (echeanceMontantPaye >= Number(echeance.montantDu)) {
        newEcheanceStatut = EcheanceStatut.PAYE;
      } else {
        newEcheanceStatut = EcheanceStatut.PARTIEL;
      }
      await this.echeanceEtudiantRepo.update(echeance.id, {
        montantPaye: echeanceMontantPaye,
        statut: newEcheanceStatut,
      });
      echeance = await this.echeanceEtudiantRepo.findOne({ where: { id: echeance.id } });
    }

    // Mise à jour de la scolarité globale
    const newStatut = montantPaye >= montantTotal ? ScolariteStatut.SOLDE : ScolariteStatut.EN_COURS;
    await this.scolariteEtudiantRepo.update(scolarite.id, { montantPaye, statut: newStatut });

    return {
      versement,
      scolarite: await this.findOneEtudiant(scolarite.id),
      echeance,
    };
  }

  // ─── Tableau de bord étudiant ────────────────────────────────────────────────

  async getDashboardEtudiant(userId: string): Promise<{
    scolarites: (ScolariteEtudiant & { echeances: EcheanceEtudiant[] })[];
    versements: VersementScolarite[];
  }> {
    const [scolarites, versements] = await Promise.all([
      this.findByUser(userId),
      this.findVersementsByUser(userId),
    ]);

    const scolaritesAvecEcheances = await Promise.all(
      scolarites.map(async (s) => {
        const echeances = await this.echeanceEtudiantRepo.find({
          where: { scolariteEtudiantId: s.id },
          order: { numero: 'ASC' },
        });
        return { ...s, echeances };
      }),
    );

    return { scolarites: scolaritesAvecEcheances, versements };
  }
}
