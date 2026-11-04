import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
  Req,
  Get,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompanyService } from './company.service';
import {
  CreateCompanyBasicDto,
  UpdateCompanyMetaDto,
  UpdateCompanyTaxDto,
  UploadDocumentsDto,
} from './dto';
import {
  JwtAuthGuard,
  AccessGuard,
  BaseController,
  AuthenticatedRequest,
} from '@Common';
import { AccountType } from '../generated/prisma/enums';

@ApiTags('Company KYB')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('company')
export class CompanyController extends BaseController {
  constructor(private readonly companyService: CompanyService) {
    super();
  }

  @Get()
  async getCompanyByAccountId(@Req() req: AuthenticatedRequest) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return this.companyService.getCompanyByAccountId(ctx.user.id);
  }

  @Post('basic')
  @ApiOperation({ summary: 'Step 2A' })
  async createBasic(
    @Body() data: CreateCompanyBasicDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return await this.companyService.upsertCompanyFirstStep(ctx.user.id, data);
  }

  @Patch('tax/:companyId')
  @ApiOperation({ summary: 'Step 2B' })
  async updateTax(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: UpdateCompanyTaxDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return await this.companyService.updateCompanyTax(
      ctx.user.id,
      companyId,
      data,
    );
  }

  @Patch('meta/:companyId')
  @ApiOperation({ summary: 'Step 2C' })
  async updateMeta(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() data: UpdateCompanyMetaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return await this.companyService.updateCompanyMeta(
      ctx.user.id,
      companyId,
      data,
    );
  }

  @Post('document/upload/:companyId')
  @ApiOperation({ summary: 'Step 2D' })
  async uploadDocuments(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() dto: UploadDocumentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return this.companyService.uploadDocuments(
      ctx.user.id,
      companyId,
      dto.documents,
    );
  }

  @Patch('update/document/upload/:companyId')
  @ApiOperation({ summary: 'Step 2D' })
  async uploadUpdateDocuments(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() dto: UploadDocumentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const ctx = this.getContext(req);
    if (ctx.user.type !== AccountType.Company) {
      throw new ForbiddenException('Not allow');
    }
    return this.companyService.uploadUpdateDocuments(
      ctx.user.id,
      companyId,
      dto.documents,
    );
  }
}
