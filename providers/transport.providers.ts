import { DataSource } from 'typeorm';
import { TransportConfig } from '../src/database/entities/transport-config.entity';
import { TransportAbonnement } from '../src/database/entities/transport-abonnement.entity';
import { VersementTransport } from '../src/database/entities/versement-transport.entity';

export const transportProviders = [
  {
    provide: 'TRANSPORT_CONFIG_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TransportConfig),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'TRANSPORT_ABONNEMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(TransportAbonnement),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VERSEMENT_TRANSPORT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(VersementTransport),
    inject: ['DATA_SOURCE'],
  },
];
