import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
