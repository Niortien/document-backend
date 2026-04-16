import { PartialType } from '@nestjs/swagger';
import { CreateScolariteConfigDto } from './create-scolarite-config.dto';

export class UpdateScolariteConfigDto extends PartialType(CreateScolariteConfigDto) {}
