import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import {
  AccessGuard,
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { ExportsService } from './exports.service';

const CSV_CONTENT_TYPE = 'text/csv';

function csvHeaders(res: Response, filename: string) {
  res.set({
    'Content-Type': CSV_CONTENT_TYPE,
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
}

@ApiTags('Exports')
@ApiBearerAuth()
@Roles(Role.Admin, Role.Trustee)
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('exports')
export class ExportsController extends BaseController {
  constructor(private readonly exportsService: ExportsService) {
    super();
  }

  @RequirePermissions('compliance_report.user_export')
  @Get('users')
  async getUsers(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'users.csv');
    return this.exportsService.getUsers();
  }

  @RequirePermissions('compliance_report.asset_export')
  @Get('assets')
  async getAssets(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'assets.csv');
    return this.exportsService.getAssets();
  }

  @RequirePermissions('compliance_report.transaction_export')
  @Get('transactions')
  async getTransactions(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'transactions.csv');
    return this.exportsService.getTransactions();
  }
}
