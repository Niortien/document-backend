import { PartialType } from '@nestjs/swagger';
import { CreateTransportConfigDto } from './create-transport-config.dto';

export class UpdateTransportConfigDto extends PartialType(CreateTransportConfigDto) {}
