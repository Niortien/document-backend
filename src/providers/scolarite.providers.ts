import { DataSource } from 'typeorm';
import { ScolariteConfig } from '../database/entities/scolarite-config.entity';
import { ScolariteEtudiant } from '../database/entities/scolarite-etudiant.entity';
import { VersementScolarite } from '../database/entities/versement-scolarite.entity';
import { EcheancierScolarite } from '../database/entities/echeancier-scolarite.entity';
import { EcheanceEtudiant } from '../database/entities/echeance-etudiant.entity';

export const scolariteProviders = [
  {
    provide: 'SCOLARITE_CONFIG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ScolariteConfig),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'SCOLARITE_ETUDIANT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(ScolariteEtudiant),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VERSEMENT_SCOLARITE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VersementScolarite),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ECHEANCIER_SCOLARITE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EcheancierScolarite),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ECHEANCE_ETUDIANT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(EcheanceEtudiant),
    inject: ['DATA_SOURCE'],
  },
];
