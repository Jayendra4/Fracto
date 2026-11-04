import { adminConfigFactory } from '@Config';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  Prisma,
  SuggestionStatus,
  Vendor,
  VendorCategory,
  VendorSuggestion,
} from '../generated/prisma/client';
import { MailService } from '../mail';
import { PrismaService } from '../prisma';

@Injectable()
export class VendorService {
  constructor(
    @Inject(adminConfigFactory.KEY)
    private readonly adminConfig: ConfigType<typeof adminConfigFactory>,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async isEmailExist(
    email: string,
    type?: string,
    excludeaccountId?: number,
  ): Promise<boolean> {
    if (type === 'vendor') {
      return (
        (await this.prisma.vendor.count({
          where: {
            email: email.toLowerCase(),
            NOT: {
              id: excludeaccountId,
            },
          },
        })) !== 0
      );
    } else {
      return (
        (await this.prisma.vendorSuggestion.count({
          where: {
            email: email.toLowerCase(),
            NOT: {
              id: excludeaccountId,
            },
          },
        })) !== 0
      );
    }
  }

  async isMobileExist(
    mobile: string,
    type?: string,
    excludeaccountId?: number,
  ): Promise<boolean> {
    if (type === 'vendor') {
      return (
        (await this.prisma.vendor.count({
          where: {
            mobile,
            NOT: {
              id: excludeaccountId,
            },
          },
        })) !== 0
      );
    } else {
      return (
        (await this.prisma.vendorSuggestion.count({
          where: {
            mobile,
            NOT: {
              id: excludeaccountId,
            },
          },
        })) !== 0
      );
    }
  }

  async getAllVendorsSuggestions(options?: {
    search?: string;
    skip?: number;
    take?: number;
    filters: {
      category?: VendorCategory;
      status?: SuggestionStatus;
    };
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: VendorSuggestion[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.VendorSuggestionWhereInput = {};
    if (options?.filters.category) {
      where.category = options?.filters.category;
    }
    if (options?.filters.status) {
      where.status = options?.filters.status;
    }
    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.VendorSuggestionWhereInput[] => [
        {
          vendorName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          mobile: {
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

    const totalvendors = await this.prisma.vendorSuggestion.count({
      where,
    });
    const vendors = await this.prisma.vendorSuggestion.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count: totalvendors,
      skip: pagination.skip,
      take: pagination.take,
      data: vendors,
    };
  }

  async getAllVendors(options?: {
    search?: string;
    skip?: number;
    take?: number;
    isActive?: boolean;
    filters: {
      category?: VendorCategory;
    };
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Vendor[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.VendorWhereInput = {};
    if (options?.filters.category) {
      where.category = options?.filters.category;
    }
    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }
    if (search) {
      const buildSearchFilter = (search: string): Prisma.VendorWhereInput[] => [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          mobile: {
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

    const totalvendors = await this.prisma.vendor.count({
      where,
    });
    const vendors = await this.prisma.vendor.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count: totalvendors,
      skip: pagination.skip,
      take: pagination.take,
      data: vendors,
    };
  }

  async getVendor(vendorId: number) {
    return await this.prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },
    });
  }

  async deleteVendor(vendorId: number) {
    const vendor = await this.getVendor(vendorId);
    if (!vendor) {
      throw new Error('vendor not found');
    }
    return this.prisma.vendor.delete({
      where: {
        id: vendorId,
      },
    });
  }

  async sendSuggestionToAdmin(
    assetOwnerId: number,
    dto: {
      vendorName: string;
      category: VendorCategory;
      description?: string;
      mobile: string;
      website?: string;
      email: string;
    },
  ) {
    if (await this.isEmailExist(dto.email)) {
      throw new Error('Email already exist');
    }
    if (dto.mobile && (await this.isMobileExist(dto.mobile))) {
      throw new Error('Mobile already exist');
    }
    const suggestion = await this.prisma.vendorSuggestion.create({
      data: {
        assetOwnerId,
        vendorName: dto.vendorName,
        category: dto.category,
        description: dto.description,
        website: dto.website,
        email: dto.email,
        mobile: dto.mobile,
        status: SuggestionStatus.Pending,
      },
    });

    await this.sendAdminNotification(suggestion);

    return {
      message: 'Vendor suggestion submitted successfully',
      id: suggestion.id,
    };
  }

  private async sendAdminNotification(
    suggestion: VendorSuggestion,
  ): Promise<void> {
    if (!this.adminConfig.AdminEmail) {
      throw new Error('ADMIN_EMAIL not configured');
    }

    await this.mailService.send({
      to: this.adminConfig.AdminEmail,
      subject: 'New Vendor Suggestion Submitted',
      mailBodyOrTemplate: {
        name: 'vendor-suggestion',
        data: {
          vendorName: suggestion.vendorName,
          category: suggestion.category,
          description: suggestion.description ?? '',
          website: suggestion.website ?? '',
          email: suggestion.email ?? '',
          suggestionId: suggestion.id,
        },
      },
      replyTo: suggestion.email ?? undefined,
    });
  }

  async create(
    adminId: number,
    data: {
      vendorName: string;
      category: VendorCategory;
      description?: string;
      website?: string;
      email: string;
      mobile: string;
    },
  ) {
    if (await this.isEmailExist(data.email, 'vendor')) {
      throw new Error('Email already exist');
    }

    if (data.mobile && (await this.isMobileExist(data.mobile, 'vendor'))) {
      throw new Error('Mobile already exist');
    }
    return await this.prisma.vendor.create({
      data: {
        createdById: adminId,
        category: data.category,
        name: data.vendorName,
        description: data.description,
        email: data.email,
        mobile: data.mobile,
        website: data.website,
      },
    });
  }

  async update(
    adminId: number,
    data: {
      vendorId: number;
      name?: string;
      category?: VendorCategory;
      description?: string;
      website?: string;
      email?: string;
      mobile?: string;
      isActive?: boolean;
    },
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.mobile !== undefined) updateData.mobile = data.mobile;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return this.prisma.vendor.update({
      where: { id: data.vendorId },
      data: updateData,
    });
  }

  async reviewSuggestion(
    suggestionId: number,
    adminId: number,
    action: SuggestionStatus,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const suggestion = await tx.vendorSuggestion.findUnique({
        where: { id: suggestionId },
      });

      if (!suggestion) {
        throw new Error('Vendor suggestion not found');
      }

      if (suggestion.status !== SuggestionStatus.Pending) {
        throw new Error(
          `Suggestion already ${suggestion.status.toLowerCase()}`,
        );
      }

      if (action === 'Approved') {
        await tx.vendor.create({
          data: {
            name: suggestion.vendorName,
            category: suggestion.category,
            description: suggestion.description,
            website: suggestion.website,
            email: suggestion.email,
            mobile: suggestion.mobile,
            createdById: adminId,
          },
        });
      }

      return tx.vendorSuggestion.update({
        where: { id: suggestionId },
        data: {
          status: action,
          reviewedAt: new Date(),
          reviewedById: adminId,
        },
      });
    });
  }
}
