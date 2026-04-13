import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Matiere } from '../database/entities/matiere.entity';
import { CreateMatiereDto } from './dto/create-matiere.dto';
import { UpdateMatiereDto } from './dto/update-matiere.dto';

@Injectable()
export class MatiereService {
  constructor(
    @Inject('MATIERE_REPOSITORY')
    private matiereRepository: Repository<Matiere>,
  ) {}

  findAll(): Promise<Matiere[]> {
    return this.matiereRepository.find({ order: { createdAt: 'DESC' },relations: ['filiere', 'niveau'] });
  }

  findByFiliere(filiereId: string): Promise<Matiere[]> {
    return this.matiereRepository.find({ where: { filiereId }, order: { name: 'ASC' }, relations: ['filiere', 'niveau'] });
  }

  findByNiveau(niveauId: string): Promise<Matiere[]> {
    return this.matiereRepository.find({ where: { niveauId }, order: { name: 'ASC' }, relations: ['filiere', 'niveau'] });
  }

  findOne(id: string): Promise<Matiere | null> {
    return this.matiereRepository.findOne({ where: { id } });
  }

  async create(dto: CreateMatiereDto): Promise<Matiere> {
    const matiere = this.matiereRepository.create(dto);
    return this.matiereRepository.save(matiere);
  }

  async update(id: string, dto: UpdateMatiereDto): Promise<Matiere | null> {
    await this.matiereRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.matiereRepository.delete(id);
  }
}
