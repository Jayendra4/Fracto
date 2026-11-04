import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UserType, UtilsService } from '@Common';
import { walletConfigFactory } from '@Config';
import { PrismaService } from '../prisma';
import { WalletTransactionsService } from '../wallet-transactions';
import {
  AccountType,
  PaymentRequestType,
  Prisma,
  RequestStatus,
  Wallet,
  WalletTransactionContext,
  WalletTransactionType,
  WalletType,
} from '../generated/prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
@Injectable()
export class WalletsService {
  constructor(
    @Inject(walletConfigFactory.KEY)
    private readonly config: ConfigType<typeof walletConfigFactory>,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly walletTransactionsService: WalletTransactionsService,
  ) {}

  async getById(
    walletId: bigint,
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Wallet> {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });
  }

  async getByaccountId(
    accountId: number,
    type: WalletType,
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Wallet> {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.wallet.findUniqueOrThrow({
      where: { accountId_type: { accountId, type } },
    });
  }

  async getWalletByAccountId(
    accountId: number,
    type: WalletType,
    options?: { tx?: Prisma.TransactionClient },
  ) {
    const prismaClient = options?.tx ?? this.prisma;

    const wallet = await prismaClient.wallet.findUnique({
      where: {
        accountId_type: {
          accountId,
          type,
        },
      },
    });

    if (!wallet) {
      throw new Error('Wallet not found for this account');
    }

    const [approved, pending, rejected] = await Promise.all([
      prismaClient.paymentRequest.aggregate({
        where: {
          AccountId: accountId,
          status: RequestStatus.Approved,
        },
        _sum: { amount: true },
      }),

      prismaClient.paymentRequest.aggregate({
        where: {
          AccountId: accountId,
          status: RequestStatus.Pending,
          requestType: PaymentRequestType.Withdraw,
        },
        _sum: { amount: true },
        _count: true,
      }),

      prismaClient.paymentRequest.aggregate({
        where: {
          AccountId: accountId,
          status: RequestStatus.Rejected,
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      ...wallet,
      approvedAmount: (approved._sum.amount ?? new Decimal(0)).toString(),
      pendingAmount: (pending._sum.amount ?? new Decimal(0)).toString(),
      rejectedAmount: (rejected._sum.amount ?? new Decimal(0)).toString(),
      pendingTransactionCount: pending._count,
    };
  }

  async getBalanceOf(
    accountId: number,
    type: WalletType,
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Prisma.Decimal> {
    const wallet = await this.getByaccountId(accountId, type, {
      tx: options?.tx,
    });

    return wallet.amount;
  }

  private getFakeDepositAmount(): Prisma.Decimal {
    return new Prisma.Decimal(this.config.fakeDepositAmount);
  }

  async getAllByaccountId(
    accountId: number,
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Wallet[]> {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.wallet.findMany({ where: { accountId } });
  }

  async create(
    accountId: number,
    type: AccountType | UserType,
    options: { tx: Prisma.TransactionClient },
  ) {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    const walletTypes: WalletType[] = [WalletType.Main];
    const isBroker = type === AccountType.Broker;
    if (isBroker) {
      walletTypes.push(WalletType.Commission);
    }
    await prismaClient.wallet.createMany({
      data: walletTypes.map((walletType) => ({
        type: walletType,
        accountId,
      })),
      skipDuplicates: true,
    });

    // Add fake initial balance into the wallet for non production environment only
    if (!this.utilsService.isProductionApp()) {
      const depositAmount = this.getFakeDepositAmount();
      await this.addBalance(accountId, depositAmount, WalletType.Main, {
        tx: options?.tx,
        context: WalletTransactionContext.Deposit,
      });
    }

    return {
      accountId,
      walletsCreated: walletTypes,
    };
  }

  async incrVersion(
    walletId: bigint,
    currentVersion: bigint,
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Wallet> {
    const prismaClient = options?.tx ? options.tx : this.prisma;
    return await prismaClient.wallet.update({
      data: {
        version: { increment: 1 },
      },
      where: {
        id: walletId,
        version: currentVersion,
      },
    });
  }

  async addBalance(
    accountId: number,
    amount: Prisma.Decimal,
    type: WalletType,
    options: {
      tx: Prisma.TransactionClient;
      context: WalletTransactionContext;
      entityId?: bigint;
      meta?: Prisma.InputJsonValue;
    },
  ) {
    const prismaClient = options.tx;

    // Remove sign
    amount = amount.abs();
    if (amount.eq(0)) {
      throw new Error('Amount should not be non zero');
    }

    return await this.utilsService.occrunnable(async () => {
      const wallet = await this.getByaccountId(accountId, type, {
        tx: options.tx,
      });
      const updatedWallet = await prismaClient.wallet.update({
        data: {
          amount: {
            increment: amount,
          },
          version: { increment: 1 },
        },
        where: {
          id: wallet.id,
          version: wallet.version,
        },
      });

      await this.walletTransactionsService.create(
        {
          context: options.context,
          walletId: wallet.id,
          type: WalletTransactionType.Credit,
          amount,
          availableBalance: updatedWallet.amount,
          nonce: updatedWallet.version,
          timestamp: updatedWallet.updatedAt,
          entityId: options.entityId,
          meta: options.meta,
        },
        { tx: options.tx },
      );

      return updatedWallet;
    });
  }

  async subtractBalance(
    accountId: number,
    amount: Prisma.Decimal,
    type: WalletType,
    options: {
      tx: Prisma.TransactionClient;
      context: WalletTransactionContext;
      entityId?: bigint | number;
      meta?: Prisma.InputJsonValue;
    },
  ) {
    const prismaClient = options.tx;

    // Remove sign
    amount = amount.abs();
    if (amount.eq(0)) {
      throw new Error('Amount should not be non zero');
    }

    return await this.utilsService.occrunnable(async () => {
      const wallet = await this.getByaccountId(accountId, type, {
        tx: options.tx,
      });
      const newAmount = wallet.amount.sub(amount);
      if (
        newAmount.lessThan(0) &&
        (type !== WalletType.Main ||
          options.context !== WalletTransactionContext.SystemWithdrawal)
      ) {
        throw new Error('Insufficient balance');
      }

      const updatedWallet = await prismaClient.wallet.update({
        data: {
          amount: newAmount,
          version: { increment: 1 },
        },
        where: {
          id: wallet.id,
          version: wallet.version,
        },
      });

      await this.walletTransactionsService.create(
        {
          context: options.context,
          walletId: wallet.id,
          type: WalletTransactionType.Debit,
          amount,
          availableBalance: updatedWallet.amount,
          nonce: updatedWallet.version,
          timestamp: updatedWallet.updatedAt,
          entityId: options.entityId,
          meta: options.meta,
        },
        { tx: options.tx },
      );

      return updatedWallet;
    });
  }

  private toBigInt(value?: number | bigint): bigint | undefined {
    if (typeof value === 'number') {
      return BigInt(value);
    }
    return value;
  }

  async transfer(
    accountId: number,
    from: WalletType,
    to: WalletType,
    amount: Prisma.Decimal,
    options: {
      tx: Prisma.TransactionClient;
      context: WalletTransactionContext;
      entityId?: bigint | number;
    },
  ) {
    if (from === to) {
      throw new Error('Source and destination wallets must be different');
    }

    amount = amount.abs();
    if (amount.eq(0)) {
      throw new Error('Transfer amount must be greater than zero');
    }

    const prismaClient = options.tx;
    const entityId = this.toBigInt(options.entityId);
    return await this.utilsService.occrunnable(async () => {
      // Ensure source wallet exists
      const sourceWallet = await this.getByaccountId(accountId, from, {
        tx: prismaClient,
      });

      // Ensure destination wallet exists
      const destinationWallet = await this.getByaccountId(accountId, to, {
        tx: prismaClient,
      });

      // Debit source wallet
      await this.subtractBalance(accountId, amount, from, {
        tx: prismaClient,
        context: options.context,
        entityId,
      });

      // Credit destination wallet
      await this.addBalance(accountId, amount, to, {
        tx: prismaClient,
        context: options.context,
        entityId,
      });

      return {
        fromWalletId: sourceWallet.id,
        toWalletId: destinationWallet.id,
        amount,
      };
    });
  }
}
