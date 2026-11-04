import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityType,
} from './activity.types';
import { ActivityLog, Prisma } from '../generated/prisma/client';

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(
    data: {
      type: ActivityType;
      actorType: ActivityActorType;
      actorId?: number;
      entityType: ActivityEntityType;
      entityId: number;
      targetId: number;
      label?: string;
      metadata?: Record<string, any>;
    },
    options?: {
      tx?: Prisma.TransactionClient;
    },
  ) {
    if (!data.targetId) {
      throw new Error('targetId is required');
    }
    const prisma = options?.tx ?? this.prisma;
    return prisma.activityLog.create({
      data: {
        type: data.type,
        actorType: data.actorType,
        actorId: data.actorId ?? null,
        entityType: data.entityType,
        entityId: data.entityId,
        targetId: data.targetId,
        label: data.label,
        metadata: data.metadata ?? {},
      },
    });
  }

  async getAll(options?: {
    targetId?: number;
    userType?: string;
    search?: string;
    skip?: number;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: ActivityLog[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.ActivityLogWhereInput = {};
    if (options?.targetId) {
      where.OR = [
        { actorId: options.targetId },
        { targetId: options.targetId },
      ];
    }
    if (options?.fromDate || options?.toDate) {
      where.createdAt = {};

      if (options.fromDate) {
        where.createdAt.gte = new Date(options.fromDate);
      }

      if (options.toDate) {
        where.createdAt.lte = new Date(options.toDate);
      }
    }
    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.ActivityLogWhereInput[] => [
        {
          label: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          type: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
      const parts = search.split(' ');
      if (parts.length !== 0) {
        where.AND = [];
        for (const part of parts) {
          if (part.trim()) {
            where.AND.push({
              OR: buildSearchFilter(part.trim()),
            });
          }
        }
      }
    }

    // console.log('data', where);

    const totalActivities = await this.prisma.activityLog.count({
      where,
    });
    const activities = await this.prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count: totalActivities,
      skip: pagination.skip,
      take: pagination.take,
      data: activities,
    };
  }
}
