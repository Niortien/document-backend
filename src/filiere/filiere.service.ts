import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Filiere } from '../database/entities/filiere.entity';
import { CreateFiliereDto } from './dto/create-filiere.dto';
import { UpdateFiliereDto } from './dto/update-filiere.dto';

@Injectable()
export class FiliereService {
  constructor(
    @Inject('FILIERE_REPOSITORY')
    private filiereRepository: Repository<Filiere>,
  ) {}

  findAll(): Promise<Filiere[]> {
    return this.filiereRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<Filiere | null> {
    return this.filiereRepository.findOne({ where: { id } });
  }

  findByCode(code: string): Promise<Filiere | null> {
    return this.filiereRepository.findOne({ where: { code } });
  }

  async create(dto: CreateFiliereDto): Promise<Filiere> {
    const filiere = this.filiereRepository.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
    return this.filiereRepository.save(filiere);
  }

  async update(id: string, dto: UpdateFiliereDto): Promise<Filiere | null> {
    await this.filiereRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.filiereRepository.delete(id);
  }
}
