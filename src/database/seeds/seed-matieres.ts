import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Filiere } from '../entities/filiere.entity';
import { Niveau } from '../entities/niveau.entity';
import { Matiere } from '../entities/matiere.entity';

const data: { filiereCode: string; niveauName: string; matieres: string[] }[] = [
  {
    filiereCode: 'ASSRI',
    niveauName: 'Licence 1',
    matieres: [
      'MAT1101 : Mathématiques 1',
      'MAT1111 : Analyse 1',
      'MAT1112 : Algèbre 1',
      'ARI1103 : Architectures des réseaux',
      'ARI1123 : Architectures des réseaux informatiques',
      'API1103 : Algorithmique et programmation',
      'API1131 : Algorithmique et programmation',
      'ASI1104 : Analyse et Conception des Systèmes d\'Information',
      'ASI1141 : Analyse et conception des systèmes d\'information',
      'SEI1105 : Système d\'exploitation',
      'SEI1151 : Système d\'exploitation et architecture des ordinateurs',
      'ANG1106 : Anglais',
      'ANG1101 : Anglais',
      'TEX1107 : Techniques d\'expression',
      'TEX1111 : Techniques d\'expression',
      'MAT1201 : Mathématiques 2',
      'MAT12011 : Analyse 2',
      'MAT12012 : Algèbre 2',
      'TWI1202 : Technologies du Web 1',
      'TWI12011 : Technologies du Web 1',
      'BD1203 : Base de données',
      'BD12031 : Base de données',
      'PYT1204 : Programmation Python',
      'PYT12041 : Programmation Python',
      'ASI1205 : Administration système 1',
      'ASI12061 : Administration système 1',
      'PRI1206 : Principes réseaux',
      'PRI12071 : Principes réseaux',
      'DP1207 : Développement personnel',
      'DP12071 : Développement personnel',
    ],
  },
  {
    filiereCode: 'ASSRI',
    niveauName: 'Licence 2',
    matieres: [
      'PSD2301 : Probabilités et statistiques',
      'PSD23011 : Probabilités et statistiques descriptives',
      'CN2302 : Calcul Numérique',
      'CN23021 : Calcul Numérique',
      'SD2303 : Structure de données',
      'SD23031 : Structure de données',
      'FS2304 : Fondamentaux de la sécurité',
      'FS23041 : Fondamentaux de la sécurité',
      'RS2305 : Réseaux et services 1',
      'RS23051 : Réseaux et services 1',
      'RS23052 : Réseaux et services 2',
      'TAN2306 : Transmission Analogique et Numérique',
      'TAN23061 : Transmission Analogique et Numérique',
      'ANG2307 : Anglais',
      'ANG23071 : Anglais',
    ],
  },
];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Filiere, Niveau, Matiere],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const filiereRepo = dataSource.getRepository(Filiere);
  const niveauRepo  = dataSource.getRepository(Niveau);
  const matiereRepo = dataSource.getRepository(Matiere);

  for (const entry of data) {
    const filiere = await filiereRepo.findOne({ where: { code: entry.filiereCode } });
    if (!filiere) {
      console.error(`Filiere not found: ${entry.filiereCode}`);
      continue;
    }

    const niveau = await niveauRepo.findOne({
      where: { name: entry.niveauName, filiereId: filiere.id },
    });
    if (!niveau) {
      console.error(`Niveau not found: ${entry.niveauName} (${entry.filiereCode})`);
      continue;
    }

    console.log(`\nProcessing ${entry.niveauName} - ${entry.filiereCode}`);

    for (const matiereName of entry.matieres) {
      const exists = await matiereRepo.findOne({
        where: { name: matiereName, filiereId: filiere.id, niveauId: niveau.id },
      });

      if (!exists) {
        await matiereRepo.save(
          matiereRepo.create({ name: matiereName, filiereId: filiere.id, niveauId: niveau.id }),
        );
        console.log(`  + ${matiereName}`);
      } else {
        console.log(`  ~ already exists: ${matiereName}`);
      }
    }
  }

  await dataSource.destroy();
  console.log('\nSeed matieres completed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
