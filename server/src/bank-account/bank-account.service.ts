import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateBankAccountDto } from './dto';
import { Bank, Prisma } from '../generated/prisma/client';
import { RazorpayService, UtilsService } from '@Common';

@Injectable()
export class BankAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async resolveOwnerDetails(
    tx: Prisma.TransactionClient,
    data: {
      ownerType: string;
      ownerId: number;
    },
  ): Promise<{
    name: string;
    email: string;
    phone: string;
    type: string;
  }> {
    const ACCOUNT_BASED_TYPES = [
      'Company',
      'Broker',
      'CorporateInvestor',
      'Trustee',
      'AssetOwner',
    ];

    if (ACCOUNT_BASED_TYPES.includes(data.ownerType)) {
      const user = await tx.account.findUnique({
        where: { id: data.ownerId },
      });
      if (!user) {
        throw new Error(`${data.ownerType} not found`);
      }
      if (!user.firstname || !user.email) {
        throw new Error(`${data.ownerType} data incomplete`);
      }

      return {
        name: user.firstname.trim(),
        email: user.email.trim(),
        phone: user.mobile ?? '',
        type: user.type,
      };
    }

    if (data.ownerType === 'admin') {
      const admin = await tx.admin.findUnique({
        where: { id: data.ownerId },
      });

      if (!admin) {
        throw new Error('Admin not found');
      }

      if (!admin.firstname || !admin.email) {
        throw new Error('Admin data incomplete');
      }

      return {
        name: admin.firstname.trim(),
        email: admin.email.trim(),
        phone: '',
        type: 'admin',
      };
    }

    throw new Error(`Unsupported owner type: ${data.ownerType}`);
  }

  async getOrCreateContactByOwner(
    paymentOwnerId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<string> {
    const prismaClient = tx ? tx : this.prisma;
    const owner = await prismaClient.paymentOwner.findUnique({
      where: { id: paymentOwnerId },
    });

    if (!owner) {
      throw new Error('Payment owner not found');
    }

    if (owner.contactId) {
      return owner.contactId;
    }

    const { name, email, phone, type } = await this.resolveOwnerDetails(
      prismaClient,
      owner,
    );

    const contact = await this.razorpayService.createContact({
      name,
      email,
      phone,
      type,
    });

    if (!contact?.id) {
      throw new Error('Failed to create Razorpay contact');
    }

    await prismaClient.paymentOwner.update({
      where: { id: paymentOwnerId },
      data: { contactId: contact.id },
    });

    return contact.id;
  }

  async create(paymentOwnerId: number, dto: CreateBankAccountDto) {
    const owner = await this.prisma.paymentOwner.findUnique({
      where: { id: paymentOwnerId },
    });

    if (!owner) {
      throw new Error('Payment owner not found');
    }

    const contactId = await this.getOrCreateContactByOwner(paymentOwnerId);

    const fundAccount = await this.razorpayService.createBankFundAccount({
      contactId,
      accountHolderName: dto.accountHolderName,
      ifscCode: dto.ifscCode,
      accountNumber: dto.accountNumber,
    });

    if (!fundAccount?.id) {
      throw new Error('Failed to create fund account in Razorpay');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.bankAccount.updateMany({
        where: {
          paymentOwnerId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      const bank = await tx.bankAccount.create({
        data: {
          paymentOwnerId,
          bankName: dto.bankName,
          accountHolderName: dto.accountHolderName,
          accountNumber: dto.accountNumber,
          ifscCode: dto.ifscCode,
          fundAccountId: fundAccount.id,
          isActive: true,
        },
      });

      return {
        message: 'Bank account added successfully',
        bankAccountId: bank.id,
      };
    });
  }

  async getActive() {
    return this.prisma.bankAccount.findMany({
      where: { isActive: true },
    });
  }

  async findAll(paymentOwnerId: number) {
    return await this.prisma.bankAccount.findMany({
      where: { paymentOwnerId },
    });
  }

  async getAllAccounts(options?: { paymentOwnerId: number; search?: string }) {
    const search = options?.search?.trim();
    // const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.BankAccountWhereInput = {
      paymentOwnerId: options?.paymentOwnerId,
      isDeleted: false,
    };
    if (search) {
      const parts = search.split(' ').filter(Boolean);

      where.AND = parts.map((part) => ({
        OR: [
          {
            bankName: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            accountNumber: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            accountHolderName: {
              contains: part,
              mode: 'insensitive',
            },
          },
          {
            ifscCode: {
              contains: part,
              mode: 'insensitive',
            },
          },
        ],
      }));
    }

    // const totalBankAccounts = await this.prisma.bankAccount.count({
    //   where,
    // });
    return await this.prisma.bankAccount.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.asc },
    });
  }

  async findOne(paymentOwnerId: number, id: number) {
    const bankAccount = await this.prisma.bankAccount.findFirst({
      where: {
        id,
        paymentOwnerId,
      },
    });

    if (!bankAccount) throw new NotFoundException('Bank account not found');

    return bankAccount;
  }

  async updateBankAccountStatus(params: {
    paymentOwnerId: number;
    bankAccountId: number;
    isActive?: boolean;
    isDeleted?: boolean;
  }) {
    const { paymentOwnerId, bankAccountId, isActive, isDeleted } = params;

    return this.prisma.$transaction(async (tx) => {
      const account = await tx.bankAccount.findFirst({
        where: {
          id: bankAccountId,
          paymentOwnerId,
        },
      });

      if (!account) {
        throw new Error('Bank account not found');
      }

      if (typeof isDeleted === 'boolean') {
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: {
            isDeleted,
            isActive: isDeleted ? false : account.isActive,
          },
        });

        return {
          message: isDeleted
            ? 'Bank account deleted successfully'
            : 'Bank account restored successfully',
        };
      }

      if (isActive === true) {
        await tx.bankAccount.updateMany({
          where: {
            paymentOwnerId,
            isActive: true,
            id: { not: bankAccountId },
          },
          data: {
            isActive: false,
          },
        });

        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { isActive: true },
        });

        return { message: 'Bank account activated successfully' };
      }

      if (isActive === false) {
        await tx.bankAccount.update({
          where: { id: bankAccountId },
          data: { isActive: false },
        });

        return { message: 'Bank account deactivated successfully' };
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

  async getAllBanks(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Bank[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.BankWhereInput = {
      isActive: true,
    };
    if (search) {
      const buildSearchFilter = (search: string): Prisma.BankWhereInput[] => [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          code: {
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

    const totalBanks = await this.prisma.bank.count({
      where,
    });

    const banks = await this.prisma.bank.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    return {
      count: totalBanks,
      skip: pagination.skip,
      take: pagination.take,
      data: banks,
    };
  }
}
