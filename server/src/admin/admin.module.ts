import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminController } from './admin.controller';
import { SubAdminsController } from './sub-admins.controller';
import { PrismaModule } from '../prisma';
import { AuditModule } from '../audit';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AdminController, SubAdminsController],
  providers: [AdminService, AdminDashboardService],
  exports: [AdminService],
})
export class AdminModule {}
