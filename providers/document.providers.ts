import { Document } from '../src/database/entities/document.entity';
import { DataSource } from 'typeorm';

export const documentProviders = [
  {
    provide: 'DOCUMENT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Document),
    inject: ['DATA_SOURCE'],
  },
];
