import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Adjust path
import { AccountType } from '../generated/prisma/enums';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllRequestedDocumentByAccountType(accountType: AccountType) {
    return this.prisma.accountRequiredDocument.findMany({
      where: {
        accountType: accountType,
      },
      include: {
        documentType: true, // Include related Document
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}
