import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma';
import { ReportsService } from './reports.service';
import { ExportsService } from './exports.service';
import { ReportsController } from './reports.controller';
import { ExportsController } from './exports.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController, ExportsController],
  providers: [ReportsService, ExportsService],
})
export class ReportsModule {}
