import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateUpiAccountDto } from './dto/create-upi-account.dto';
import { Prisma } from '../generated/prisma/client';
import { BankAccountService } from '../bank-account/bank-account.service';
import { RazorpayService } from '@Common';

@Injectable()
export class UpiAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bankAccountService: BankAccountService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async create(paymentOwnerId: number, data: CreateUpiAccountDto) {
    const owner = await this.prisma.paymentOwner.findUnique({
      where: { id: paymentOwnerId },
      select: { id: true },
    });

    if (!owner) {
      throw new Error('Payment owner not found');
    }

    const contactId =
      await this.bankAccountService.getOrCreateContactByOwner(paymentOwnerId);
    const fundAccount = await this.razorpayService.createUpiFundAccount({
      contactId,
      vpa: data.upiId,
    });

    if (!fundAccount?.id) {
      throw new Error('Failed to create fund account in Razorpay');
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.upiAccount.updateMany({
        where: {
          paymentOwnerId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      const upi = await tx.upiAccount.create({
        data: {
          paymentOwnerId,
          upiId: data.upiId,
          qrCode: data.qrCode,
          fundAccountId: fundAccount.id,
          isActive: true,
        },
      });

      return {
        message: 'UPI account added successfully',
        upiAccountId: upi.id,
      };
    });
  }

  async findAll(paymentOwnerId: number) {
    return await this.prisma.upiAccount.findMany({
      where: { paymentOwnerId },
    });
  }

  async getAllUpiAccounts(options?: {
    paymentOwnerId: number;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    // const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.UpiAccountWhereInput = {
      paymentOwnerId: options?.paymentOwnerId,
      isDeleted: false,
    };
    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.UpiAccountWhereInput[] => [
        {
          upiId: {
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

    // const totalUpiAccounts = await this.prisma.upiAccount.count({
    //   where,
    // });
    return await this.prisma.upiAccount.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  async getActive() {
    return this.prisma.upiAccount.findMany({
      where: { isActive: true },
    });
  }
  async findOne(paymentOwnerId: number, id: number) {
    const upiAccount = await this.prisma.upiAccount.findFirst({
      where: { id, paymentOwnerId },
    });

    if (!upiAccount) throw new Error('UPI account not found');

    return upiAccount;
  }

  async updateUpiAccountStatus(params: {
    paymentOwnerId: number;
    upiAccountId: number;
    isActive?: boolean;
    isDeleted?: boolean;
  }) {
    const { paymentOwnerId, upiAccountId, isActive, isDeleted } = params;

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.upiAccount.findFirst({
        where: {
          id: upiAccountId,
          paymentOwnerId,
        },
      });

      if (!account) {
        throw new Error('UPI account not found');
      }

      if (account.isDeleted && isDeleted !== false) {
        throw new Error('UPI account is already deleted');
      }

      if (isDeleted === true) {
        await tx.upiAccount.update({
          where: { id: upiAccountId },
          data: {
            isDeleted: true,
            isActive: false,
          },
        });

        return { message: 'UPI account deleted successfully' };
      }

      if (isDeleted === false) {
        await tx.upiAccount.update({
          where: { id: upiAccountId },
          data: {
            isDeleted: false,
          },
        });

        return { message: 'UPI account restored successfully' };
      }

      if (isActive === true) {
        if (account.isDeleted) {
          throw new Error('Cannot activate deleted UPI account');
        }

        await tx.upiAccount.updateMany({
          where: {
            paymentOwnerId,
            isActive: true,
            id: { not: upiAccountId },
          },
          data: {
            isActive: false,
          },
        });

        await tx.upiAccount.update({
          where: { id: upiAccountId },
          data: {
            isActive: true,
          },
        });

        return { message: 'UPI account activated successfully' };
      }

      if (isActive === false) {
        await tx.upiAccount.update({
          where: { id: upiAccountId },
          data: {
            isActive: false,
          },
        });

        return { message: 'UPI account deactivated successfully' };
      }

      return { message: 'No changes applied' };
    });
  }

  async getOrCreateOwner(ownerType: string, ownerId: number) {
    let owner = await this.prisma.paymentOwner.findFirst({
      where: { ownerType, ownerId },
    });

    if (!owner) {
      owner = await this.prisma.paymentOwner.create({
        data: {
          ownerType,
          ownerId,
        },
      });
    }

    return owner;
  }
}
