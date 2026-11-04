import { Injectable } from '@nestjs/common';
import { toCsv } from '@Common';
import { PrismaService } from '../prisma';
import { AccountType } from '../generated/prisma/client';
import { ReportsService } from './reports.service';

@Injectable()
export class ExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
  ) {}

  async getUsers(): Promise<string> {
    const accounts = await this.prisma.account.findMany({
      where: { isDeleted: false, type: { not: AccountType.Trustee } },
      include: { country: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const rows = accounts.map((account) => ({
      ...account,
      country: account.country?.name ?? '',
    }));

    return toCsv(rows, [
      { key: 'id', header: 'Account ID' },
      { key: 'firstname', header: 'First Name' },
      { key: 'lastname', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'dialCode', header: 'Dial Code' },
      { key: 'mobile', header: 'Mobile' },
      { key: 'type', header: 'Account Type' },
      { key: 'status', header: 'Status' },
      { key: 'isVerified', header: 'Is Verified' },
      { key: 'isDocumentUploaded', header: 'Documents Uploaded' },
      { key: 'country', header: 'Country' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'updatedAt', header: 'Updated At' },
    ]);
  }

  async getAssets(): Promise<string> {
    return this.reportsService.buildAssetsCsv({});
  }

  async getTransactions(): Promise<string> {
    const transactions = await this.prisma.walletTransaction.findMany({
      include: {
        wallet: {
          include: {
            account: {
              select: { firstname: true, lastname: true, email: true },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
    });

    const rows = transactions.map((transaction) => ({
      ...transaction,
      accountId: transaction.wallet.accountId,
      accountName:
        `${transaction.wallet.account.firstname} ${transaction.wallet.account.lastname}`.trim(),
      accountEmail: transaction.wallet.account.email,
      walletType: transaction.wallet.type,
    }));

    return toCsv(rows, [
      { key: 'id', header: 'Transaction ID' },
      { key: 'accountId', header: 'Account ID' },
      { key: 'accountName', header: 'Account Name' },
      { key: 'accountEmail', header: 'Account Email' },
      { key: 'walletType', header: 'Wallet Type' },
      { key: 'type', header: 'Transaction Type' },
      { key: 'context', header: 'Context' },
      { key: 'amount', header: 'Amount' },
      { key: 'availableBalance', header: 'Available Balance' },
      { key: 'status', header: 'Status' },
      { key: 'timestamp', header: 'Timestamp' },
    ]);
  }
}
