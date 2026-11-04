import { PartialType } from '@nestjs/swagger';
import { CreateGroupRequestDto } from './create-group-request.dto';

export class UpdateGroupRequestDto extends PartialType(CreateGroupRequestDto) {}
