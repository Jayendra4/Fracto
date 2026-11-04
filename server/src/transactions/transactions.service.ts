import { Injectable } from '@nestjs/common';
import { UserType, UtilsService, StorageService } from '@Common';
import { ExportFormat } from './dto';
import { WalletTransactionsService } from '../wallet-transactions';
import {
  Account,
  WalletTransaction,
  WalletTransactionContext,
  WalletTransactionType,
  WalletType,
} from '../generated/prisma/client';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly walletTransactionsService: WalletTransactionsService,
    private readonly storageService: StorageService,
  ) {}

  private async getNarration(
    userContext: UserType,
    tx: WalletTransaction & { wallet: { account: Account } },
  ): Promise<string> {
    let narration = '';
    if (
      tx.context === WalletTransactionContext.Deposit ||
      tx.context === WalletTransactionContext.Withdrawal ||
      tx.context === WalletTransactionContext.WithdrawalRefund
    ) {
    }

    if (
      tx.context === WalletTransactionContext.SystemDeposit ||
      tx.context === WalletTransactionContext.SystemWithdrawal
    ) {
      const meta = tx.meta;
      if (meta && typeof meta === 'object' && 'narration' in meta) {
        narration = (meta.narration as string).concat(
          'reference' in meta ? ` (Ref: ${meta.reference})` : '',
        );
      }
    }

    if (tx.context === WalletTransactionContext.FractionsPurchase) {
    }

    return narration;
  }

  async getAll(
    userContext: UserType,
    options?: {
      search?: string;
      filters?: {
        accountId?: number;
        fromDate?: Date;
        toDate?: Date;
        context?: WalletTransactionContext;
        walletType?: WalletType;
        type?: WalletTransactionType;
      };
      export?: boolean;
      exportFormat?: ExportFormat;
      skip?: number;
      take?: number;
    },
  ) {
    const filters = options?.filters || {};
    const exportData = options?.export || false;
    const exportFormat = options?.exportFormat || ExportFormat.Excel;
    const {
      count,
      skip,
      take,
      data: walletTransactions,
    } = await this.walletTransactionsService.getAll({
      search: options?.search,
      filters: {
        accountId: filters.accountId,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        context: filters.context,
        walletType: filters.walletType,
        type: filters.type,
      },
      skip: options?.skip,
      take: options?.take,
    });

    const response = await this.utilsService.batchable(
      walletTransactions,
      async (walletTransaction) => {
        const tx = {
          ...walletTransaction,
          narration: await this.getNarration(userContext, walletTransaction),
        };

        if (userContext === UserType.User) {
          return this.utilsService.exclude(tx, ['wallet']);
        } else {
          return tx;
        }
      },
    );

    if (!exportData) {
      return { count, skip, take, data: response };
    } else {
      throw new Error(
        `Export format '${exportFormat}' not supported at this moment`,
      );
    }
  }
}
