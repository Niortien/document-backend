import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
  ) {}

 async findAll(filters: FindUsersDto = {}): Promise<User[]> {
  const qb = this.userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.filiere', 'filiere')
    .leftJoinAndSelect('user.niveau', 'niveau');

  if (filters.search) {
    const term = `%${filters.search.toLowerCase()}%`;
    qb.andWhere(
      '(LOWER(user.firstName) LIKE :term OR LOWER(user.lastName) LIKE :term OR LOWER(user.email) LIKE :term)',
      { term },
    );
  }
  if (filters.role) {
    qb.andWhere('user.role = :role', { role: filters.role });
  }
  if (filters.filiereId) {
    qb.andWhere('user.filiereId = :filiereId', { filiereId: filters.filiereId });
  }
  if (filters.niveauId) {
    qb.andWhere('user.niveauId = :niveauId', { niveauId: filters.niveauId });
  }
  if (filters.isActive !== undefined) {
    qb.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
  }

  return qb.orderBy('user.createdAt', 'DESC').getMany();
}

  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id }, relations: ['filiere', 'niveau'] });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

 async create(createUserDto: CreateUserDto): Promise<User> {
  const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
  const user = this.userRepository.create({
    ...createUserDto,
    password: hashedPassword,
    isActive: createUserDto.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const savedUser = await this.userRepository.save(user);

  const createdUser = await this.userRepository.findOne({
    where: { id: savedUser.id },
  });

  if (!createdUser) {
    throw new Error('Failed to create user');
  }

  return createdUser;
}

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}
