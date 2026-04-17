import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Filiere } from '../entities/filiere.entity';
import { Niveau } from '../entities/niveau.entity';
import { Matiere } from '../entities/matiere.entity';
import { NoteEtudiant, StatutNote } from '../entities/note-etudiant.entity';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

/** Computes moyenne matière: classe × 0.4 + examen × 0.6 */
function calcMoy(mc: number | null, me: number | null): number | null {
  if (mc == null || me == null) return null;
  return parseFloat((mc * 0.4 + me * 0.6).toFixed(2));
}

function statut(moy: number | null): StatutNote {
  if (moy == null) return StatutNote.EN_COURS;
  if (moy >= 10) return StatutNote.VALIDE;
  return StatutNote.EN_SESSION;
}

// ─── Data: filieres ──────────────────────────────────────────────────────────

const FILIERES: { code: string; name: string }[] = [
  { code: 'SEA',   name: 'SEA'   },
  { code: 'SEG',   name: 'SEG'   },
  { code: 'ASSRI', name: 'ASSRI' },
  { code: 'MIAGE', name: 'MIAGE' },
  { code: 'RIT',   name: 'RIT'   },
  { code: 'SJAP',  name: 'SJAP'  },
  { code: '3EA',   name: '3EA'   },
];

const NIVEAUX = ['Licence 1', 'Licence 2', 'Licence 3'];

// ─── Data: matieres per filiere ───────────────────────────────────────────────
// Format: { code, name, coefficient, isModule, subMatieres? }[]
// subMatieres: when isModule=true, these are the child matieres

type MatiereInput = {
  name: string;
  coefficient: number;
  isModule?: boolean;
  subMatieres?: { name: string; coefficient: number }[];
};

const MATIERES_BY_FILIERE: Record<string, Record<string, MatiereInput[]>> = {
  SEA: {
    'Licence 1': [
      { name: 'Mathématiques 1', coefficient: 6, isModule: true, subMatieres: [
        { name: 'Analyse 1', coefficient: 3 },
        { name: 'Algèbre 1', coefficient: 3 },
      ]},
      { name: 'Physique 1', coefficient: 4 },
      { name: 'Informatique de base', coefficient: 3 },
      { name: 'Anglais 1', coefficient: 2 },
      { name: 'Techniques d\'expression', coefficient: 2 },
      { name: 'Gestion de projet', coefficient: 3 },
    ],
    'Licence 2': [
      { name: 'Mathématiques 2', coefficient: 6, isModule: true, subMatieres: [
        { name: 'Analyse 2', coefficient: 3 },
        { name: 'Probabilités', coefficient: 3 },
      ]},
      { name: 'Physique 2', coefficient: 4 },
      { name: 'Électronique', coefficient: 4 },
      { name: 'Anglais 2', coefficient: 2 },
      { name: 'Statistiques', coefficient: 3 },
    ],
    'Licence 3': [
      { name: 'Mathématiques avancées', coefficient: 5 },
      { name: 'Électronique avancée', coefficient: 5 },
      { name: 'Automatique', coefficient: 4 },
      { name: 'Traitement du signal', coefficient: 4 },
      { name: 'Projet de fin d\'études', coefficient: 6 },
    ],
  },
  SEG: {
    'Licence 1': [
      { name: 'Économie 1', coefficient: 5, isModule: true, subMatieres: [
        { name: 'Microéconomie', coefficient: 3 },
        { name: 'Macroéconomie', coefficient: 2 },
      ]},
      { name: 'Comptabilité générale', coefficient: 5 },
      { name: 'Droit des affaires', coefficient: 3 },
      { name: 'Informatique bureautique', coefficient: 2 },
      { name: 'Anglais commercial', coefficient: 2 },
      { name: 'Mathématiques financières', coefficient: 3 },
    ],
    'Licence 2': [
      { name: 'Finance d\'entreprise', coefficient: 5 },
      { name: 'Comptabilité analytique', coefficient: 5 },
      { name: 'Marketing', coefficient: 4 },
      { name: 'Droit fiscal', coefficient: 3 },
      { name: 'Statistiques appliquées', coefficient: 3 },
    ],
    'Licence 3': [
      { name: 'Audit et contrôle de gestion', coefficient: 5 },
      { name: 'Finance avancée', coefficient: 5 },
      { name: 'Management stratégique', coefficient: 4 },
      { name: 'Fiscalité approfondie', coefficient: 4 },
      { name: 'Mémoire de fin d\'études', coefficient: 6 },
    ],
  },
  ASSRI: {
    'Licence 1': [
      { name: 'Mathématiques 1', coefficient: 6, isModule: true, subMatieres: [
        { name: 'Analyse 1', coefficient: 3 },
        { name: 'Algèbre 1', coefficient: 3 },
      ]},
      { name: 'Architectures des réseaux', coefficient: 4 },
      { name: 'Algorithmique et programmation', coefficient: 4 },
      { name: 'Analyse et Conception des SI', coefficient: 3 },
      { name: 'Système d\'exploitation', coefficient: 3 },
      { name: 'Anglais', coefficient: 2 },
      { name: 'Techniques d\'expression', coefficient: 2 },
    ],
    'Licence 2': [
      { name: 'Probabilités et statistiques', coefficient: 4 },
      { name: 'Structure de données', coefficient: 4 },
      { name: 'Fondamentaux de la sécurité', coefficient: 4 },
      { name: 'Réseaux et services', coefficient: 4, isModule: true, subMatieres: [
        { name: 'Réseaux et services 1', coefficient: 2 },
        { name: 'Réseaux et services 2', coefficient: 2 },
      ]},
      { name: 'Transmission Analogique et Numérique', coefficient: 3 },
      { name: 'Anglais', coefficient: 2 },
    ],
    'Licence 3': [
      { name: 'Sécurité des réseaux avancée', coefficient: 5 },
      { name: 'Virtualisation et Cloud', coefficient: 4 },
      { name: 'Administration système avancée', coefficient: 4 },
      { name: 'Forensic et investigation', coefficient: 4 },
      { name: 'Projet de fin d\'études', coefficient: 6 },
    ],
  },
  MIAGE: {
    'Licence 1': [
      { name: 'Mathématiques pour l\'informatique', coefficient: 5, isModule: true, subMatieres: [
        { name: 'Algèbre linéaire', coefficient: 3 },
        { name: 'Analyse', coefficient: 2 },
      ]},
      { name: 'Programmation procédurale', coefficient: 4 },
      { name: 'Bases de données', coefficient: 4 },
      { name: 'Réseaux informatiques', coefficient: 3 },
      { name: 'Anglais', coefficient: 2 },
      { name: 'Introduction au management', coefficient: 2 },
    ],
    'Licence 2': [
      { name: 'Génie logiciel', coefficient: 5 },
      { name: 'Bases de données avancées', coefficient: 4 },
      { name: 'Programmation orientée objet', coefficient: 4 },
      { name: 'Systèmes d\'exploitation', coefficient: 3 },
      { name: 'Statistiques et probabilités', coefficient: 3 },
      { name: 'Anglais 2', coefficient: 2 },
    ],
    'Licence 3': [
      { name: 'Développement web avancé', coefficient: 5 },
      { name: 'Développement mobile', coefficient: 4 },
      { name: 'Intelligence artificielle', coefficient: 4 },
      { name: 'Sécurité applicative', coefficient: 3 },
      { name: 'Projet de fin d\'études', coefficient: 6 },
    ],
  },
  RIT: {
    'Licence 1': [
      { name: 'Mathématiques des télécoms', coefficient: 5, isModule: true, subMatieres: [
        { name: 'Mathématiques 1A', coefficient: 3 },
        { name: 'Mathématiques 1B', coefficient: 2 },
      ]},
      { name: 'Électronique de base', coefficient: 4 },
      { name: 'Signaux et systèmes', coefficient: 4 },
      { name: 'Informatique', coefficient: 3 },
      { name: 'Anglais', coefficient: 2 },
      { name: 'Physique des télécoms', coefficient: 3 },
    ],
    'Licence 2': [
      { name: 'Réseaux 2', coefficient: 5 },
      { name: 'Télécommunications', coefficient: 5 },
      { name: 'Traitement du signal', coefficient: 4 },
      { name: 'Électronique avancée', coefficient: 4 },
      { name: 'Anglais technique', coefficient: 2 },
    ],
    'Licence 3': [
      { name: 'Réseaux mobiles 4G/5G', coefficient: 5 },
      { name: 'Fibre optique', coefficient: 4 },
      { name: 'Sécurité télécom', coefficient: 4 },
      { name: 'Internet des objets', coefficient: 4 },
      { name: 'Projet de fin d\'études', coefficient: 6 },
    ],
  },
  SJAP: {
    'Licence 1': [
      { name: 'Droit constitutionnel', coefficient: 5, isModule: true, subMatieres: [
        { name: 'Droit public', coefficient: 3 },
        { name: 'Droit privé', coefficient: 2 },
      ]},
      { name: 'Sciences politiques', coefficient: 4 },
      { name: 'Histoire du droit', coefficient: 3 },
      { name: 'Sociologie juridique', coefficient: 3 },
      { name: 'Anglais juridique', coefficient: 2 },
      { name: 'Méthodologie juridique', coefficient: 3 },
    ],
    'Licence 2': [
      { name: 'Droit des contrats', coefficient: 5 },
      { name: 'Droit pénal', coefficient: 5 },
      { name: 'Procédure civile', coefficient: 4 },
      { name: 'Relations internationales', coefficient: 3 },
      { name: 'Anglais juridique 2', coefficient: 2 },
    ],
    'Licence 3': [
      { name: 'Droit des affaires', coefficient: 5 },
      { name: 'Droit du travail', coefficient: 4 },
      { name: 'Droit administratif avancé', coefficient: 4 },
      { name: 'Droit du numérique', coefficient: 4 },
      { name: 'Mémoire de fin d\'études', coefficient: 6 },
    ],
  },
  '3EA': {
    'Licence 1': [
      { name: 'Énergies renouvelables 1', coefficient: 5, isModule: true, subMatieres: [
        { name: 'Énergie solaire', coefficient: 3 },
        { name: 'Énergie éolienne', coefficient: 2 },
      ]},
      { name: 'Électrotechnique', coefficient: 5 },
      { name: 'Physique de l\'énergie', coefficient: 4 },
      { name: 'Mathématiques', coefficient: 3 },
      { name: 'Anglais technique', coefficient: 2 },
      { name: 'Environnement et développement durable', coefficient: 3 },
    ],
    'Licence 2': [
      { name: 'Éolien et solaire avancé', coefficient: 5 },
      { name: 'Machines électriques', coefficient: 5 },
      { name: 'Stockage d\'énergie', coefficient: 4 },
      { name: 'Réseaux électriques intelligents', coefficient: 4 },
      { name: 'Anglais 2', coefficient: 2 },
    ],
    'Licence 3': [
      { name: 'Efficacité énergétique', coefficient: 5 },
      { name: 'Hydraulique et biomasse', coefficient: 4 },
      { name: 'Smart Grids', coefficient: 4 },
      { name: 'Audit énergétique', coefficient: 4 },
      { name: 'Projet de fin d\'études', coefficient: 6 },
    ],
  },
};

// ─── Data: 70 students distributed across all filieres ───────────────────────
// ~10 per filiere (7 filieres × 10 = 70)

const STUDENTS_BY_FILIERE: Record<string, { firstName: string; lastName: string; niveau: string }[]> = {
  SEA: [
    { firstName: 'Abdou',    lastName: 'Niang',     niveau: 'Licence 1' },
    { firstName: 'Mariama',  lastName: 'Ba',         niveau: 'Licence 1' },
    { firstName: 'Ousmane',  lastName: 'Fall',       niveau: 'Licence 1' },
    { firstName: 'Khadija',  lastName: 'Gueye',      niveau: 'Licence 2' },
    { firstName: 'Aliou',    lastName: 'Thiam',      niveau: 'Licence 2' },
    { firstName: 'Rokhaya',  lastName: 'Diouf',      niveau: 'Licence 2' },
    { firstName: 'Saliou',   lastName: 'Diagne',     niveau: 'Licence 3' },
    { firstName: 'Ndéye',    lastName: 'Mbaye',      niveau: 'Licence 3' },
    { firstName: 'Babacar',  lastName: 'Ly',         niveau: 'Licence 3' },
    { firstName: 'Astou',    lastName: 'Faye',       niveau: 'Licence 1' },
  ],
  SEG: [
    { firstName: 'Malick',   lastName: 'Sarr',       niveau: 'Licence 1' },
    { firstName: 'Aminata',  lastName: 'Diallo',     niveau: 'Licence 1' },
    { firstName: 'Boubacar', lastName: 'Cissé',      niveau: 'Licence 1' },
    { firstName: 'Seynabou', lastName: 'Ndiaye',     niveau: 'Licence 2' },
    { firstName: 'Ibrahima', lastName: 'Koné',       niveau: 'Licence 2' },
    { firstName: 'Coumba',   lastName: 'Traoré',     niveau: 'Licence 2' },
    { firstName: 'Mamadou',  lastName: 'Bah',        niveau: 'Licence 3' },
    { firstName: 'Khady',    lastName: 'Seck',       niveau: 'Licence 3' },
    { firstName: 'Serigne',  lastName: 'Mbengue',    niveau: 'Licence 3' },
    { firstName: 'Fatou',    lastName: 'Diop',       niveau: 'Licence 1' },
  ],
  ASSRI: [
    { firstName: 'Amadou',    lastName: 'Diallo',    niveau: 'Licence 1' },
    { firstName: 'Ibrahima',  lastName: 'Sow',       niveau: 'Licence 1' },
    { firstName: 'Aïssata',   lastName: 'Camara',    niveau: 'Licence 1' },
    { firstName: 'Moussa',    lastName: 'Kouyaté',   niveau: 'Licence 2' },
    { firstName: 'Ndeye',     lastName: 'Ly',        niveau: 'Licence 2' },
    { firstName: 'Cheikh',    lastName: 'Gassama',   niveau: 'Licence 2' },
    { firstName: 'Pape',      lastName: 'Diaw',      niveau: 'Licence 3' },
    { firstName: 'Sokhna',    lastName: 'Ndoye',     niveau: 'Licence 3' },
    { firstName: 'Abdoulaye', lastName: 'Badiane',   niveau: 'Licence 3' },
    { firstName: 'Fatima',    lastName: 'Kanté',     niveau: 'Licence 1' },
    // 10 nouveaux étudiants – Licence 1 ASSRI
    { firstName: 'Oumar',     lastName: 'Baldé',     niveau: 'Licence 1' },
    { firstName: 'Mariama',   lastName: 'Kourouma',  niveau: 'Licence 1' },
    { firstName: 'Seydou',    lastName: 'Traoré',    niveau: 'Licence 1' },
    { firstName: 'Kadiatou',  lastName: 'Sylla',     niveau: 'Licence 1' },
    { firstName: 'Mamadou',   lastName: 'Diakité',   niveau: 'Licence 1' },
    { firstName: 'Fatoumata', lastName: 'Bah',       niveau: 'Licence 1' },
    { firstName: 'Alpha',     lastName: 'Condé',     niveau: 'Licence 1' },
    { firstName: 'Hawa',      lastName: 'Diallo',    niveau: 'Licence 1' },
    { firstName: 'Lamine',    lastName: 'Touré',     niveau: 'Licence 1' },
    { firstName: 'Aminata',   lastName: 'Keita',     niveau: 'Licence 1' },
  ],
  MIAGE: [
    { firstName: 'Lamine',   lastName: 'Diatta',     niveau: 'Licence 1' },
    { firstName: 'Mariétou', lastName: 'Cissokho',   niveau: 'Licence 1' },
    { firstName: 'Hassane',  lastName: 'Diallo',     niveau: 'Licence 1' },
    { firstName: 'Rokhaya',  lastName: 'Samb',       niveau: 'Licence 2' },
    { firstName: 'Modou',    lastName: 'Ndiaye',     niveau: 'Licence 2' },
    { firstName: 'Awa',      lastName: 'Guissé',     niveau: 'Licence 2' },
    { firstName: 'Thierno',  lastName: 'Barry',      niveau: 'Licence 3' },
    { firstName: 'Dieynaba', lastName: 'Sakho',      niveau: 'Licence 3' },
    { firstName: 'Idrissa',  lastName: 'Touré',      niveau: 'Licence 3' },
    { firstName: 'Bintou',   lastName: 'Keita',      niveau: 'Licence 1' },
  ],
  RIT: [
    { firstName: 'Oumar',    lastName: 'Diallo',     niveau: 'Licence 1' },
    { firstName: 'Kadiatou', lastName: 'Bah',        niveau: 'Licence 1' },
    { firstName: 'Sidy',     lastName: 'Coulibaly',  niveau: 'Licence 1' },
    { firstName: 'Mame',     lastName: 'Thiaw',      niveau: 'Licence 2' },
    { firstName: 'Birame',   lastName: 'Diouf',      niveau: 'Licence 2' },
    { firstName: 'Yaye',     lastName: 'Faye',       niveau: 'Licence 2' },
    { firstName: 'Mouhamed', lastName: 'Kane',       niveau: 'Licence 3' },
    { firstName: 'Ndéye',    lastName: 'Sène',       niveau: 'Licence 3' },
    { firstName: 'Alioune',  lastName: 'Mbodj',      niveau: 'Licence 3' },
    { firstName: 'Ismaila',  lastName: 'Ba',         niveau: 'Licence 1' },
  ],
  SJAP: [
    { firstName: 'Seydou',   lastName: 'Diallo',     niveau: 'Licence 1' },
    { firstName: 'Nafissatou',lastName: 'Sylla',     niveau: 'Licence 1' },
    { firstName: 'Mountaga', lastName: 'Kante',      niveau: 'Licence 1' },
    { firstName: 'Dieynaba', lastName: 'Diallo',     niveau: 'Licence 2' },
    { firstName: 'Souleymane',lastName: 'Camara',    niveau: 'Licence 2' },
    { firstName: 'Rouguy',   lastName: 'Barry',      niveau: 'Licence 2' },
    { firstName: 'Elhadj',   lastName: 'Baldé',      niveau: 'Licence 3' },
    { firstName: 'Mariama',  lastName: 'Sow',        niveau: 'Licence 3' },
    { firstName: 'Aboubacar',lastName: 'Diallo',     niveau: 'Licence 3' },
    { firstName: 'Hawa',     lastName: 'Touré',      niveau: 'Licence 1' },
  ],
  '3EA': [
    { firstName: 'Boubacar', lastName: 'Bah',        niveau: 'Licence 1' },
    { firstName: 'Oumou',    lastName: 'Diallo',     niveau: 'Licence 1' },
    { firstName: 'Mamadou',  lastName: 'Sacko',      niveau: 'Licence 1' },
    { firstName: 'Kadija',   lastName: 'Condé',      niveau: 'Licence 2' },
    { firstName: 'Alpha',    lastName: 'Balde',      niveau: 'Licence 2' },
    { firstName: 'Fatoumata',lastName: 'Kourouma',   niveau: 'Licence 2' },
    { firstName: 'Ibrahima', lastName: 'Kouyaté',    niveau: 'Licence 3' },
    { firstName: 'Halimatou',lastName: 'Diallo',     niveau: 'Licence 3' },
    { firstName: 'Cheikh',   lastName: 'Kouyaté',    niveau: 'Licence 3' },
    { firstName: 'Djenabou', lastName: 'Sow',        niveau: 'Licence 1' },
  ],
};

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Filiere, Niveau, Matiere, NoteEtudiant],
    synchronize: true,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  console.log('✅ Connecté à la base de données\n');

  const filiereRepo  = dataSource.getRepository(Filiere);
  const niveauRepo   = dataSource.getRepository(Niveau);
  const userRepo     = dataSource.getRepository(User);
  const matiereRepo  = dataSource.getRepository(Matiere);
  const noteRepo     = dataSource.getRepository(NoteEtudiant);

  const hashedPwd = await bcrypt.hash('Password123!', 10);

  for (const filiereData of FILIERES) {
    console.log(`\n═══ Filière : ${filiereData.code} ═══`);

    // 1. Ensure filiere exists
    let filiere = await filiereRepo.findOne({ where: { code: filiereData.code } });
    if (!filiere) {
      filiere = await filiereRepo.save(filiereRepo.create({ code: filiereData.code, name: filiereData.name, isActive: true }));
      console.log(`  📁 Filière créée : ${filiereData.code}`);
    }

    // 2. Ensure niveaux exist
    const niveauxMap: Record<string, Niveau> = {};
    for (const niveauName of NIVEAUX) {
      let niveau = await niveauRepo.findOne({ where: { name: niveauName, filiereId: filiere.id } });
      if (!niveau) {
        niveau = await niveauRepo.save(niveauRepo.create({ name: niveauName, filiereId: filiere.id }));
        console.log(`  📁 Niveau créé : ${niveauName}`);
      }
      niveauxMap[niveauName] = niveau;
    }

    // 3. Create matieres per niveau
    const matieresMap: Record<string, Record<string, Matiere[]>> = {}; // niveauName -> matiereName -> Matiere[]
    for (const niveauName of NIVEAUX) {
      const niveau = niveauxMap[niveauName];
      const matieresData = MATIERES_BY_FILIERE[filiereData.code]?.[niveauName] ?? [];
      matieresMap[niveauName] = {};

      for (const m of matieresData) {
        if (m.isModule && m.subMatieres) {
          // Create parent module
          let parent = await matiereRepo.findOne({
            where: { name: m.name, filiereId: filiere.id, niveauId: niveau.id },
          });
          if (!parent) {
            parent = await matiereRepo.save(matiereRepo.create({
              name: m.name,
              coefficient: m.coefficient,
              isModule: true,
              parentId: null,
              filiereId: filiere.id,
              niveauId: niveau.id,
            }));
            console.log(`  📚 Module créé : ${m.name}`);
          }
          matieresMap[niveauName][m.name] = [parent];

          // Create sub-matieres
          for (const sub of m.subMatieres) {
            let subM = await matiereRepo.findOne({
              where: { name: sub.name, filiereId: filiere.id, niveauId: niveau.id },
            });
            if (!subM) {
              subM = await matiereRepo.save(matiereRepo.create({
                name: sub.name,
                coefficient: sub.coefficient,
                isModule: false,
                parentId: parent.id,
                filiereId: filiere.id,
                niveauId: niveau.id,
              }));
              console.log(`    ↳ Sous-matière créée : ${sub.name}`);
            }
            matieresMap[niveauName][sub.name] = [subM];
          }
        } else {
          // Simple matiere
          let mat = await matiereRepo.findOne({
            where: { name: m.name, filiereId: filiere.id, niveauId: niveau.id },
          });
          if (!mat) {
            mat = await matiereRepo.save(matiereRepo.create({
              name: m.name,
              coefficient: m.coefficient,
              isModule: false,
              parentId: null,
              filiereId: filiere.id,
              niveauId: niveau.id,
            }));
            console.log(`  📚 Matière créée : ${m.name}`);
          }
          matieresMap[niveauName][m.name] = [mat];
        }
      }
    }

    // 4. Create students for this filiere
    const studentsData = STUDENTS_BY_FILIERE[filiereData.code] ?? [];
    const createdStudents: { user: User; niveau: Niveau }[] = [];

    for (const s of studentsData) {
      const slug = `${removeDiacritics(s.firstName).toLowerCase()}.${removeDiacritics(s.lastName).toLowerCase()}`;
      const email = `${slug}.${filiereData.code.toLowerCase()}@ecole.sn`;

      let user = await userRepo.findOne({ where: { email } });
      if (!user) {
        const niveau = niveauxMap[s.niveau];
        user = await userRepo.save(userRepo.create({
          firstName: s.firstName,
          lastName: s.lastName,
          email,
          password: hashedPwd,
          role: UserRole.ETUDIANT,
          filiereId: filiere.id,
          niveauId: niveau.id,
          isActive: true,
          imageUrl: null,
        }));
        console.log(`  👤 Étudiant créé : ${s.firstName} ${s.lastName} (${s.niveau})`);
      } else {
        console.log(`  👤 Déjà existant : ${s.firstName} ${s.lastName}`);
      }
      createdStudents.push({ user, niveau: niveauxMap[s.niveau] });
    }

    // 5. Create notes for each student × each non-module matiere in their niveau
    console.log(`\n  📝 Saisie des notes...`);
    for (const { user, niveau } of createdStudents) {
      const niveauMatieres = MATIERES_BY_FILIERE[filiereData.code]?.[niveau.name] ?? [];

      for (const m of niveauMatieres) {
        // Collect leaf matieres (sub-matieres if module, otherwise the matiere itself)
        const leafMatieres: Matiere[] = [];
        if (m.isModule && m.subMatieres) {
          for (const sub of m.subMatieres) {
            const stored = matieresMap[niveau.name][sub.name];
            if (stored?.[0]) leafMatieres.push(stored[0]);
          }
        } else {
          const stored = matieresMap[niveau.name][m.name];
          if (stored?.[0]) leafMatieres.push(stored[0]);
        }

        for (const matiere of leafMatieres) {
          const existing = await noteRepo.findOne({
            where: { etudiantId: user.id, matiereId: matiere.id, anneeAcademique: '2025-2026' },
          });
          if (existing) continue;

          // Generate realistic notes (mix of bon, moyen, faible)
          const roll = Math.random();
          let mc: number | null;
          let me: number | null;

          if (roll < 0.15) {
            // Note en cours (pas encore saisie)
            mc = null;
            me = null;
          } else if (roll < 0.25) {
            // Note faible → en session
            mc = rand(4, 9);
            me = rand(3, 8);
          } else if (roll < 0.45) {
            // Note moyenne (autour de 10)
            mc = rand(8, 13);
            me = rand(7, 12);
          } else {
            // Note bonne
            mc = rand(11, 18);
            me = rand(12, 19);
          }

          const moy = calcMoy(mc, me);
          const st = statut(moy);

          await noteRepo.save(noteRepo.create({
            etudiantId: user.id,
            matiereId: matiere.id,
            anneeAcademique: '2025-2026',
            moyenneClasse: mc,
            moyenneExamen: me,
            moyenneMatiere: moy,
            statut: st,
            moyenneSession: null,
          }));
        }
      }
      console.log(`    ✓ Notes saisies pour ${user.firstName} ${user.lastName}`);
    }
  }

  await dataSource.destroy();
  console.log('\n✅ Seed fake data terminé — 70 étudiants + matieres + notes créés.');
}

/** Remove diacritics for generating email slugs */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

seed().catch((err) => {
  console.error('❌ Seed échoué :', err);
  process.exit(1);
});
