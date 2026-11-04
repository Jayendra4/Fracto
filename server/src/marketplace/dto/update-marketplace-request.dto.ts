import { PartialType } from '@nestjs/swagger';
import { CreateMarketplaceRequestDto } from './create-marketplace-request.dto';

export class UpdateGroupRequestDto extends PartialType(
  CreateMarketplaceRequestDto,
) {}
