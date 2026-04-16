import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TransportConfig } from '../database/entities/transport-config.entity';
import { TransportAbonnement, TransportStatut, TransportTypeAbonnement } from '../database/entities/transport-abonnement.entity';
import { VersementTransport } from '../database/entities/versement-transport.entity';
import { CreateTransportConfigDto } from './dto/create-transport-config.dto';
import { UpdateTransportConfigDto } from './dto/update-transport-config.dto';
import { CreateTransportAbonnementDto } from './dto/create-transport-abonnement.dto';
import { CreateVersementTransportDto } from './dto/create-versement-transport.dto';

@Injectable()
export class TransportService {
  constructor(
    @Inject('TRANSPORT_CONFIG_REPOSITORY')
    private readonly transportConfigRepo: Repository<TransportConfig>,
    @Inject('TRANSPORT_ABONNEMENT_REPOSITORY')
    private readonly abonnementRepo: Repository<TransportAbonnement>,
    @Inject('VERSEMENT_TRANSPORT_REPOSITORY')
    private readonly versementRepo: Repository<VersementTransport>,
  ) {}

  // ─── TransportConfig ─────────────────────────────────────────────────────────

  async findAllConfigs(): Promise<TransportConfig[]> {
    return this.transportConfigRepo.find({ order: { anneeAcademique: 'DESC', createdAt: 'DESC' } });
  }

  async findOneConfig(id: string): Promise<TransportConfig> {
    const config = await this.transportConfigRepo.findOne({ where: { id } });
    if (!config) throw new NotFoundException(`Configuration transport introuvable (id: ${id})`);
    return config;
  }

  async createConfig(dto: CreateTransportConfigDto): Promise<TransportConfig> {
    const config = this.transportConfigRepo.create({ ...dto, isActive: dto.isActive ?? true });
    return this.transportConfigRepo.save(config);
  }

  async updateConfig(id: string, dto: UpdateTransportConfigDto): Promise<TransportConfig> {
    await this.findOneConfig(id);
    await this.transportConfigRepo.update(id, dto);
    return this.findOneConfig(id);
  }

  async removeConfig(id: string): Promise<void> {
    await this.findOneConfig(id);
    await this.transportConfigRepo.delete(id);
  }

  // ─── Abonnement ──────────────────────────────────────────────────────────────

  async findAllAbonnements(): Promise<TransportAbonnement[]> {
    return this.abonnementRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOneAbonnement(id: string): Promise<TransportAbonnement> {
    const item = await this.abonnementRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Abonnement transport introuvable (id: ${id})`);
    return item;
  }

  async findByUser(userId: string): Promise<TransportAbonnement[]> {
    return this.abonnementRepo.find({ where: { userId }, order: { anneeAcademique: 'DESC' } });
  }

  async createAbonnement(dto: CreateTransportAbonnementDto): Promise<TransportAbonnement> {
    const config = await this.findOneConfig(dto.transportConfigId);

    const existing = await this.abonnementRepo.findOne({
      where: { userId: dto.userId, anneeAcademique: config.anneeAcademique, typeAbonnement: dto.typeAbonnement },
    });
    if (existing) {
      throw new BadRequestException(
        `Cet étudiant a déjà un abonnement ${dto.typeAbonnement} pour l'année ${config.anneeAcademique}`,
      );
    }

    const montantTotal =
      dto.typeAbonnement === TransportTypeAbonnement.MENSUEL
        ? config.montantMensuel
        : config.montantAnnuel;

    const abonnement = this.abonnementRepo.create({
      userId: dto.userId,
      transportConfigId: dto.transportConfigId,
      anneeAcademique: config.anneeAcademique,
      typeAbonnement: dto.typeAbonnement,
      montantTotal,
      montantPaye: 0,
      statut: TransportStatut.ACTIF,
      notes: dto.notes ?? null,
    });
    return this.abonnementRepo.save(abonnement);
  }

  async removeAbonnement(id: string): Promise<void> {
    await this.findOneAbonnement(id);
    await this.abonnementRepo.delete(id);
  }

  // ─── Versements ──────────────────────────────────────────────────────────────

  async findVersementsByAbonnement(transportAbonnementId: string): Promise<VersementTransport[]> {
    return this.versementRepo.find({
      where: { transportAbonnementId },
      order: { datePaiement: 'DESC' },
    });
  }

  async findVersementsByUser(userId: string): Promise<VersementTransport[]> {
    return this.versementRepo.find({
      where: { userId },
      order: { datePaiement: 'DESC' },
    });
  }

  async createVersement(dto: CreateVersementTransportDto): Promise<{ versement: VersementTransport; abonnement: TransportAbonnement }> {
    const abonnement = await this.findOneAbonnement(dto.transportAbonnementId);

    const montantPaye = Number(abonnement.montantPaye) + Number(dto.montant);
    const montantTotal = Number(abonnement.montantTotal);

    if (montantPaye > montantTotal) {
      throw new BadRequestException(
        `Le montant versé (${dto.montant}) dépasse le restant à payer (${montantTotal - Number(abonnement.montantPaye)})`,
      );
    }

    const versement = this.versementRepo.create({
      transportAbonnementId: dto.transportAbonnementId,
      userId: abonnement.userId,
      montant: dto.montant,
      datePaiement: new Date(dto.datePaiement),
      moisConcerne: dto.moisConcerne ?? null,
      motif: dto.motif ?? null,
    });
    await this.versementRepo.save(versement);

    const newStatut = montantPaye >= montantTotal ? TransportStatut.SOLDE : TransportStatut.ACTIF;
    await this.abonnementRepo.update(abonnement.id, { montantPaye, statut: newStatut });

    const updatedAbonnement = await this.findOneAbonnement(abonnement.id);
    return { versement, abonnement: updatedAbonnement };
  }

  // ─── Tableau de bord étudiant ────────────────────────────────────────────────

  async getDashboardEtudiant(userId: string): Promise<{
    abonnements: TransportAbonnement[];
    versements: VersementTransport[];
  }> {
    const [abonnements, versements] = await Promise.all([
      this.findByUser(userId),
      this.findVersementsByUser(userId),
    ]);
    return { abonnements, versements };
  }
}
