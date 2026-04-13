import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Document, FileType } from '../database/entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

export interface CreateDocumentPayload extends CreateDocumentDto {
  fileUrl: string;
  fileType: FileType;
}

@Injectable()
export class DocumentService {
  constructor(
    @Inject('DOCUMENT_REPOSITORY')
    private documentRepository: Repository<Document>,
  ) {}

  findAll(): Promise<Document[]> {
    return this.documentRepository.find({ order: { createdAt: 'DESC' } });
  }

  findByFiliere(filiereId: string): Promise<Document[]> {
    return this.documentRepository.find({ where: { filiereId }, order: { createdAt: 'DESC' } });
  }

  findByNiveau(niveauId: string): Promise<Document[]> {
    return this.documentRepository.find({ where: { niveauId }, order: { createdAt: 'DESC' } });
  }

  findByMatiere(matiereId: string): Promise<Document[]> {
    return this.documentRepository.find({ where: { matiereId }, order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<Document | null> {
    return this.documentRepository.findOne({ where: { id } });
  }

  async create(payload: CreateDocumentPayload): Promise<Document> {
    const document = this.documentRepository.create(payload);
    return this.documentRepository.save(document);
  }

  async update(id: string, dto: UpdateDocumentDto): Promise<Document | null> {
    await this.documentRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.documentRepository.delete(id);
  }
}
