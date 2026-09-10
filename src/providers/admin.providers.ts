import { DataSource } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Filiere } from '../database/entities/filiere.entity';
import { Niveau } from '../database/entities/niveau.entity';
import { ScolariteEtudiant } from '../database/entities/scolarite-etudiant.entity';
import { EcheanceEtudiant } from '../database/entities/echeance-etudiant.entity';
import { VersementScolarite } from '../database/entities/versement-scolarite.entity';
import { TransportAbonnement } from '../database/entities/transport-abonnement.entity';
import { VersementTransport } from '../database/entities/versement-transport.entity';

export const adminProviders = [
  {
    provide: 'ADMIN_USER_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_FILIERE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Filiere),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_NIVEAU_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Niveau),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_SCOLARITE_ETUDIANT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ScolariteEtudiant),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_ECHEANCE_ETUDIANT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EcheanceEtudiant),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_VERSEMENT_SCOLARITE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VersementScolarite),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_TRANSPORT_ABONNEMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TransportAbonnement),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ADMIN_VERSEMENT_TRANSPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VersementTransport),
    inject: ['DATA_SOURCE'],
  },
];
