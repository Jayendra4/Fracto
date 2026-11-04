import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DocumentService } from './document.service';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
} from '@Common';
import { AccountType } from '../generated/prisma/client';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('documents')
export class DocumentController extends BaseController {
  constructor(private readonly documentService: DocumentService) {
    super();
  }

  @Get('me/required')
  async getDocumentRequirements(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    return this.documentService.findAllRequestedDocumentByAccountType(
      ctx.user.type as AccountType,
    );
  }
}
