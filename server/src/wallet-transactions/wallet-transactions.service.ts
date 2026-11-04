import { Injectable } from '@nestjs/common';

import { isNumberString } from 'class-validator';
import { PrismaService } from '../prisma';
import {
  Prisma,
  WalletTransaction,
  WalletTransactionContext,
  WalletTransactionType,
  WalletType,
} from '../generated/prisma/client';

// const FractionWalletTransactionContexts = [
//   WalletTransactionContext.FractionsPurchase,
// ];

@Injectable()
export class WalletTransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: {
      context: WalletTransactionContext;
      walletId: bigint;
      type: WalletTransactionType;
      amount: Prisma.Decimal;
      availableBalance: Prisma.Decimal;
      nonce: bigint;
      timestamp: Date;
      entityId?: bigint | number;
      meta?: Prisma.InputJsonValue;
    },
    options?: { tx?: Prisma.TransactionClient },
  ) {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.walletTransaction.create({
      data: {
        context: data.context,
        type: data.type,
        walletId: data.walletId,
        amount: data.amount,
        availableBalance: data.availableBalance,
        nonce: data.nonce,
        timestamp: data.timestamp,
        entityId: data.entityId,
        meta: data.meta,
      },
    });
  }

  async createMany(
    data: {
      context: WalletTransactionContext;
      walletId: bigint;
      type: WalletTransactionType;
      amount: Prisma.Decimal;
      availableBalance: Prisma.Decimal;
      nonce: number;
      timestamp: Date;
      entityId?: bigint | number;
      meta?: Prisma.InputJsonValue;
    }[],
    options?: { tx?: Prisma.TransactionClient },
  ) {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.walletTransaction.createMany({
      data: data.map((t) => ({
        context: t.context,
        type: t.type,
        walletId: t.walletId,
        amount: t.amount,
        availableBalance: t.availableBalance,
        nonce: t.nonce,
        timestamp: t.timestamp,
        entityId: t.entityId,
        meta: t.meta,
      })),
    });
  }
  async getAll(options?: {
    search?: string;
    filters?: {
      accountId?: number;
      fromDate?: Date;
      toDate?: Date;
      context?: WalletTransactionContext;
      walletType?: WalletType;
      type?: WalletTransactionType;
    };
    orderBy?: keyof WalletTransaction;
    sortOrder?: Prisma.SortOrder;
    skip?: number;
    take?: number;
  }) {
    if (!options) options = {};

    const searchText = options.search?.trim();

    if (!options.orderBy) {
      options.orderBy = options.filters?.walletType ? 'nonce' : 'timestamp';
    }

    const where: Prisma.WalletTransactionWhereInput = {
      context: options.filters?.context,
      type: options.filters?.type,

      wallet: {
        accountId: options.filters?.accountId,
        type: options.filters?.walletType,
        account: searchText
          ? {
              OR: [
                {
                  firstname: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
                {
                  lastname: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
                {
                  email: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
                {
                  mobile: {
                    contains: searchText,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : undefined,
      },

      timestamp: {
        gte: options.filters?.fromDate,
        lte: options.filters?.toDate,
      },

      OR:
        searchText && isNumberString(searchText)
          ? [
              {
                id: BigInt(searchText),
              },
            ]
          : undefined,
    };

    const totalTransactions = await this.prisma.walletTransaction.count({
      where,
    });

    const transactions = await this.prisma.walletTransaction.findMany({
      where,
      include: {
        wallet: {
          select: {
            account: true,
          },
        },
      },
      orderBy: {
        [options.orderBy]: options.sortOrder || Prisma.SortOrder.desc,
      },
      skip: options.skip ?? 0,
      take: options.take ?? 10,
    });

    return {
      count: totalTransactions,
      skip: options.skip ?? 0,
      take: options.take ?? 10,
      data: transactions,
    };
  }
}
