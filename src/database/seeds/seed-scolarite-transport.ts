import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Filiere } from '../entities/filiere.entity';
import { Niveau } from '../entities/niveau.entity';
import { ScolariteConfig } from '../entities/scolarite-config.entity';
import { ScolariteEtudiant, ScolariteStatut } from '../entities/scolarite-etudiant.entity';
import { VersementScolarite } from '../entities/versement-scolarite.entity';
import { TransportConfig } from '../entities/transport-config.entity';
import { TransportAbonnement, TransportStatut, TransportTypeAbonnement } from '../entities/transport-abonnement.entity';
import { VersementTransport } from '../entities/versement-transport.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
      User, Filiere, Niveau,
      ScolariteConfig, ScolariteEtudiant, VersementScolarite,
      TransportConfig, TransportAbonnement, VersementTransport,
    ],
    synchronize: true,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  console.log('✅ Connecté à la base de données');

  const filiereRepo        = dataSource.getRepository(Filiere);
  const niveauRepo         = dataSource.getRepository(Niveau);
  const userRepo            = dataSource.getRepository(User);
  const scolariteConfigRepo = dataSource.getRepository(ScolariteConfig);
  const scolariteEtudiantRepo = dataSource.getRepository(ScolariteEtudiant);
  const versementScolRepo   = dataSource.getRepository(VersementScolarite);
  const transportConfigRepo = dataSource.getRepository(TransportConfig);
  const abonnementRepo      = dataSource.getRepository(TransportAbonnement);
  const versementTranspRepo = dataSource.getRepository(VersementTransport);

  // ─── 1. Filières & Niveaux ──────────────────────────────────────────────────
  let filiere = await filiereRepo.findOne({ where: { code: 'ASSRI' } });
  if (!filiere) {
    filiere = await filiereRepo.save(filiereRepo.create({ code: 'ASSRI', name: 'ASSRI', isActive: true }));
    console.log('📁 Filière ASSRI créée');
  }

  let niveauL1 = await niveauRepo.findOne({ where: { name: 'Licence 1', filiereId: filiere.id } });
  if (!niveauL1) {
    niveauL1 = await niveauRepo.save(niveauRepo.create({ name: 'Licence 1', filiereId: filiere.id }));
    console.log('📁 Niveau Licence 1 créé');
  }

  let niveauL2 = await niveauRepo.findOne({ where: { name: 'Licence 2', filiereId: filiere.id } });
  if (!niveauL2) {
    niveauL2 = await niveauRepo.save(niveauRepo.create({ name: 'Licence 2', filiereId: filiere.id }));
    console.log('📁 Niveau Licence 2 créé');
  }

  // ─── 2. Étudiants ───────────────────────────────────────────────────────────
  const studentsData = [
    { firstName: 'Amadou',  lastName: 'Diallo',  email: 'amadou.diallo@ecole.sn',  niveauId: niveauL1.id },
    { firstName: 'Fatou',   lastName: 'Ndiaye',  email: 'fatou.ndiaye@ecole.sn',   niveauId: niveauL1.id },
    { firstName: 'Moussa',  lastName: 'Sow',     email: 'moussa.sow@ecole.sn',     niveauId: niveauL2.id },
    { firstName: 'Aïssata', lastName: 'Camara',  email: 'aissata.camara@ecole.sn', niveauId: niveauL2.id },
    { firstName: 'Ibrahim', lastName: 'Coulibaly', email: 'ibrahim.coulibaly@ecole.sn', niveauId: niveauL1.id },
  ];

  const students: User[] = [];
  for (const s of studentsData) {
    let user = await userRepo.findOne({ where: { email: s.email } });
    if (!user) {
      const hashed = await bcrypt.hash('Password123!', 10);
      user = await userRepo.save(userRepo.create({
        ...s,
        password: hashed,
        role: UserRole.ETUDIANT,
        filiereId: filiere.id,
        isActive: true,
        imageUrl: null,
      }));
      console.log(`👤 Étudiant créé : ${user.firstName} ${user.lastName}`);
    } else {
      console.log(`👤 Étudiant déjà existant : ${user.firstName} ${user.lastName}`);
    }
    students.push(user);
  }

  // ─── 3. Configurations de scolarité ─────────────────────────────────────────
  let configL1 = await scolariteConfigRepo.findOne({ where: { anneeAcademique: '2025-2026', niveauId: niveauL1.id } });
  if (!configL1) {
    configL1 = await scolariteConfigRepo.save(scolariteConfigRepo.create({
      anneeAcademique: '2025-2026',
      montantTotal: 350000,
      montantInscription: 100000,
      description: 'Frais scolarité Licence 1 ASSRI 2025-2026',
      isActive: true,
      filiereId: filiere.id,
      niveauId: niveauL1.id,
    }));
    console.log('💰 Config scolarité L1 créée (350 000 FCFA)');
  }

  let configL2 = await scolariteConfigRepo.findOne({ where: { anneeAcademique: '2025-2026', niveauId: niveauL2.id } });
  if (!configL2) {
    configL2 = await scolariteConfigRepo.save(scolariteConfigRepo.create({
      anneeAcademique: '2025-2026',
      montantTotal: 400000,
      montantInscription: 120000,
      description: 'Frais scolarité Licence 2 ASSRI 2025-2026',
      isActive: true,
      filiereId: filiere.id,
      niveauId: niveauL2.id,
    }));
    console.log('💰 Config scolarité L2 créée (400 000 FCFA)');
  }

  // ─── 4. Configuration transport ──────────────────────────────────────────────
  let transportConfig = await transportConfigRepo.findOne({ where: { anneeAcademique: '2025-2026' } });
  if (!transportConfig) {
    transportConfig = await transportConfigRepo.save(transportConfigRepo.create({
      anneeAcademique: '2025-2026',
      montantMensuel: 15000,
      montantAnnuel: 150000,
      description: 'Ligne campus - centre ville (aller-retour)',
      isActive: true,
    }));
    console.log('🚌 Config transport créée (15 000 FCFA/mois | 150 000 FCFA/an)');
  }

  // ─── 5. Scolarités étudiants + versements ────────────────────────────────────
  // Étudiants L1 : students[0], students[1], students[4]
  // Étudiants L2 : students[2], students[3]

  const scolaritesData = [
    // Amadou L1 : a payé 200 000 sur 350 000
    { student: students[0], config: configL1, versements: [100000, 100000], dates: ['2025-10-01', '2025-12-15'] },
    // Fatou L1 : a tout payé (soldé)
    { student: students[1], config: configL1, versements: [100000, 150000, 100000], dates: ['2025-10-01', '2025-11-20', '2026-01-10'] },
    // Moussa L2 : a payé 120 000 (juste l'inscription)
    { student: students[2], config: configL2, versements: [120000], dates: ['2025-10-05'] },
    // Aïssata L2 : a payé 280 000 sur 400 000
    { student: students[3], config: configL2, versements: [120000, 160000], dates: ['2025-10-05', '2025-12-20'] },
    // Ibrahim L1 : n'a pas encore payé (0 versement)
    { student: students[4], config: configL1, versements: [], dates: [] },
  ];

  for (const item of scolaritesData) {
    let scolarite = await scolariteEtudiantRepo.findOne({
      where: { userId: item.student.id, anneeAcademique: '2025-2026' },
    });

    if (!scolarite) {
      const totalPaye = item.versements.reduce((a, b) => a + b, 0);
      const statut = totalPaye >= Number(item.config.montantTotal)
        ? ScolariteStatut.SOLDE
        : ScolariteStatut.EN_COURS;

      scolarite = await scolariteEtudiantRepo.save(scolariteEtudiantRepo.create({
        userId: item.student.id,
        scolariteConfigId: item.config.id,
        anneeAcademique: '2025-2026',
        montantTotal: item.config.montantTotal,
        montantPaye: totalPaye,
        statut,
        notes: null,
      }));
      console.log(`📚 Scolarité créée pour ${item.student.firstName} (payé: ${totalPaye} / ${item.config.montantTotal})`);

      for (let i = 0; i < item.versements.length; i++) {
        await versementScolRepo.save(versementScolRepo.create({
          scolariteEtudiantId: scolarite.id,
          userId: item.student.id,
          montant: item.versements[i],
          datePaiement: new Date(item.dates[i]),
          motif: i === 0 ? "Versement inscription" : `Versement ${i + 1}`,
        }));
        console.log(`  💳 Versement scolarité : ${item.versements[i]} FCFA le ${item.dates[i]}`);
      }
    } else {
      console.log(`📚 Scolarité déjà existante pour ${item.student.firstName}`);
    }
  }

  // ─── 6. Abonnements transport + versements ───────────────────────────────────
  const abonnementsData = [
    // Amadou : abonné annuel, a payé 100 000 sur 150 000
    { student: students[0], type: TransportTypeAbonnement.ANNUEL,   versements: [75000, 25000], dates: ['2025-10-01', '2025-12-01'], mois: [null, null] },
    // Fatou : abonnée mensuel Octobre, Novembre, Décembre (tout payé)
    { student: students[1], type: TransportTypeAbonnement.MENSUEL,  versements: [15000], dates: ['2025-10-01'], mois: ['Octobre 2025'] },
    // Moussa : pas de transport
    // Aïssata : abonnée mensuel, a payé Octobre et Novembre
    { student: students[3], type: TransportTypeAbonnement.MENSUEL,  versements: [15000], dates: ['2025-10-05'], mois: ['Octobre 2025'] },
  ];

  for (const item of abonnementsData) {
    const existing = await abonnementRepo.findOne({
      where: { userId: item.student.id, anneeAcademique: '2025-2026', typeAbonnement: item.type },
    });

    if (!existing) {
      const montantTotal = item.type === TransportTypeAbonnement.ANNUEL
        ? Number(transportConfig.montantAnnuel)
        : Number(transportConfig.montantMensuel);

      const totalPaye = item.versements.reduce((a, b) => a + b, 0);
      const statut = totalPaye >= montantTotal ? TransportStatut.SOLDE : TransportStatut.ACTIF;

      const abonnement = await abonnementRepo.save(abonnementRepo.create({
        userId: item.student.id,
        transportConfigId: transportConfig.id,
        anneeAcademique: '2025-2026',
        typeAbonnement: item.type,
        montantTotal,
        montantPaye: totalPaye,
        statut,
        notes: null,
      }));
      console.log(`🚌 Abonnement transport (${item.type}) créé pour ${item.student.firstName} (payé: ${totalPaye} / ${montantTotal})`);

      for (let i = 0; i < item.versements.length; i++) {
        await versementTranspRepo.save(versementTranspRepo.create({
          transportAbonnementId: abonnement.id,
          userId: item.student.id,
          montant: item.versements[i],
          datePaiement: new Date(item.dates[i]),
          moisConcerne: item.mois[i] ?? null,
          motif: `Versement transport ${i + 1}`,
        }));
        console.log(`  💳 Versement transport : ${item.versements[i]} FCFA le ${item.dates[i]}`);
      }
    } else {
      console.log(`🚌 Abonnement transport déjà existant pour ${item.student.firstName}`);
    }
  }

  await dataSource.destroy();
  console.log('\n✅ Seed scolarité & transport terminé.');
}

seed().catch((err) => {
  console.error('❌ Seed échoué :', err);
  process.exit(1);
});
