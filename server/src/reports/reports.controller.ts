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
import { ReportsService } from './reports.service';

const CSV_CONTENT_TYPE = 'text/csv';

function csvHeaders(res: Response, filename: string) {
  res.set({
    'Content-Type': CSV_CONTENT_TYPE,
    'Content-Disposition': `attachment; filename="${filename}"`,
  });
}

@ApiTags('Reports')
@ApiBearerAuth()
@Roles(Role.Admin, Role.Trustee)
@RequirePermissions('reports.view')
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController extends BaseController {
  constructor(private readonly reportsService: ReportsService) {
    super();
  }

  @Get('platform-activity')
  async getPlatformActivity(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'platform_activity_last_30_days.csv');
    return this.reportsService.getPlatformActivityReport();
  }

  @Get('kyc-status')
  async getKycStatus(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'kyc_status_all_users.csv');
    return this.reportsService.getKycStatusReport();
  }

  @Get('asset-pipeline')
  async getAssetPipeline(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'asset_pipeline.csv');
    return this.reportsService.getAssetPipelineReport();
  }

  @Get('funding-pipeline')
  async getFundingPipeline(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'funding_pipeline_funded.csv');
    return this.reportsService.getFundingPipelineReport();
  }

  @Get('broker-performance')
  async getBrokerPerformance(@Res({ passthrough: true }) res: Response) {
    csvHeaders(res, 'broker_performance.csv');
    return this.reportsService.getBrokerPerformanceReport();
  }
}
