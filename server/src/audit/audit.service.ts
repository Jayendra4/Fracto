import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { AuditLog, Prisma } from '../generated/prisma/client';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    data: {
      actorAdminId: number;
      action: string;
      targetType: 'Role' | 'Admin' | 'Account';
      targetId: number;
      metadata?: Prisma.InputJsonValue;
      ipAddress?: string;
    },
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<AuditLog> {
    const prismaClient = options?.tx ? options.tx : this.prisma;

    return await prismaClient.auditLog.create({
      data: {
        actorAdminId: data.actorAdminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
      },
    });
  }
}
