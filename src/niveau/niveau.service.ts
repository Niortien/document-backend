import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Niveau } from '../database/entities/niveau.entity';
import { CreateNiveauDto } from './dto/create-niveau.dto';
import { UpdateNiveauDto } from './dto/update-niveau.dto';

@Injectable()
export class NiveauService {
  constructor(
    @Inject('NIVEAU_REPOSITORY')
    private niveauRepository: Repository<Niveau>,
  ) {}

  findAll(): Promise<Niveau[]> {
    return this.niveauRepository.find({ order: { createdAt: 'DESC' }, relations: ['filiere'] });
  }

  findByFiliere(filiereId: string): Promise<Niveau[]> {
    return this.niveauRepository.find({ where: { filiereId }, order: { name: 'ASC' }, relations: ['filiere'] });
  }

  findOne(id: string): Promise<Niveau | null> {
    return this.niveauRepository.findOne({ where: { id }, relations: ['filiere'] });
  }

  async create(dto: CreateNiveauDto): Promise<Niveau> {
    const niveau = this.niveauRepository.create(dto);
    return this.niveauRepository.save(niveau);
  }

  async update(id: string, dto: UpdateNiveauDto): Promise<Niveau | null> {
    await this.niveauRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.niveauRepository.delete(id);
  }
}
