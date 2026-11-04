import {
  Controller,
  Post,
  Param,
  Body,
  BadRequestException,
  UseGuards,
  Req,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DirectorService } from './director.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import {
  JwtAuthGuard,
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
} from '@Common';
import { UploadDocumentsDto } from './dto';

@ApiTags('Directors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('companies/:companyId/directors')
export class DirectorController extends BaseController {
  constructor(private readonly directorService: DirectorService) {
    super();
  }

  @Post()
  @ApiOperation({
    summary: 'Create director with address and documents, and start KYC/AML',
  })
  async createDirector(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: CreateDirectorDto,
  ) {
    try {
      return await this.directorService.upsertDirector(companyId, data);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('document/upload/:directorId')
  @ApiOperation({ summary: 'Upload Multiple Company Documents (Step 2D)' })
  async uploadDocuments(
    @Param('directorId', ParseIntPipe) directorId: number,
    @Body() dto: UploadDocumentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return this.directorService.uploadDocuments(
      ctx.user.id,
      directorId,
      dto.documents,
    );
  }

  @Patch('update/document/upload/:directorId')
  @ApiOperation({ summary: 'Upload Multiple Company Documents (Step 2D)' })
  async uploadUpdateDocuments(
    @Param('directorId', ParseIntPipe) directorId: number,
    @Body() dto: UploadDocumentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    return this.directorService.uploadUpdateDocuments(
      ctx.user.id,
      directorId,
      dto.documents,
    );
  }
}
