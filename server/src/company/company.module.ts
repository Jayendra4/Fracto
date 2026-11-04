import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma';
import { NotificationModule } from '../notification';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
