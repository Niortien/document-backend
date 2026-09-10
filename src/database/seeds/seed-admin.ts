import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../entities/user.entity';
import { Filiere } from '../entities/filiere.entity';
import { Niveau } from '../entities/niveau.entity';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Filiere, Niveau],
    synchronize: false,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  console.log('✅ Connecté à la base de données');

  const userRepo = dataSource.getRepository(User);

  const seedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!seedPassword) {
    throw new Error('SEED_ADMIN_PASSWORD env var is required to seed the admin account');
  }

  const admins = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@ecole.sn',
      password: seedPassword,
    },
  ];

  const hashedPwd = await bcrypt.hash(admins[0].password, 10);

  for (const data of admins) {
    const existing = await userRepo.findOne({ where: { email: data.email } });

    if (existing) {
      // Met à jour le mot de passe et le rôle si le compte existe déjà
      await userRepo.update(existing.id, {
        password: hashedPwd,
        role: UserRole.ADMIN,
        isActive: true,
      });
      console.log(`🔄 Admin mis à jour : ${data.email}`);
    } else {
      await userRepo.save(
        userRepo.create({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: hashedPwd,
          role: UserRole.ADMIN,
          isActive: true,
          filiereId: null,
          niveauId: null,
          imageUrl: null,
        }),
      );
      console.log(`✅ Admin créé : ${data.email}`);
    }
  }

  await dataSource.destroy();
  console.log('🎉 Seed admin terminé.');
}

seed().catch((err) => {
  console.error('❌ Seed admin échoué :', err);
  process.exit(1);
});
