import { PartialType } from '@nestjs/swagger';
import { CreateJoinGroupRequestDto } from './create-join-group-request.dto';

export class UpdateGroupRequestDto extends PartialType(
  CreateJoinGroupRequestDto,
) {}
