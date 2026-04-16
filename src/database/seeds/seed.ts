import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Filiere } from '../entities/filiere.entity';
import { Niveau } from '../entities/niveau.entity';

const filieres = [
  { code: 'SEA',   name: 'SEA' },
  { code: 'SEG',   name: 'SEG' },
  { code: 'ASSRI', name: 'ASSRI' },
  { code: 'MIAGE', name: 'MIAGE' },
  { code: 'RIT',   name: 'RIT' },
  { code: 'SJAP',  name: 'SJAP' },
  { code: '3EA',   name: '3EA' },
];

const niveauNames = ['Licence 1', 'Licence 2', 'Licence 3'];

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [Filiere, Niveau],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  console.log('Connected to database');

  const filiereRepo = dataSource.getRepository(Filiere);
  const niveauRepo  = dataSource.getRepository(Niveau);

  for (const data of filieres) {
    let filiere = await filiereRepo.findOne({ where: { code: data.code } });

    if (!filiere) {
      filiere = filiereRepo.create({ ...data, isActive: true });
      filiere = await filiereRepo.save(filiere);
      console.log(`Created filiere: ${filiere.code}`);
    } else {
      console.log(`Filiere already exists: ${filiere.code}`);
    }

    for (const niveauName of niveauNames) {
      const exists = await niveauRepo.findOne({
        where: { name: niveauName, filiereId: filiere.id },
      });

      if (!exists) {
        const niveau = niveauRepo.create({ name: niveauName, filiereId: filiere.id });
        await niveauRepo.save(niveau);
        console.log(`  Created niveau: ${niveauName} (${filiere.code})`);
      } else {
        console.log(`  Niveau already exists: ${niveauName} (${filiere.code})`);
      }
    }
  }

  await dataSource.destroy();
  console.log('Seed completed.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
