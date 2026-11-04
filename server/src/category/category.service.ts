import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import {
  Category,
  CategoryRequestStatus,
  CategoryStatus,
  Prisma,
} from '../generated/prisma/client';
@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) { }

  async isCategoryExist(
    name: string,
    excludecategoryId?: number,
  ): Promise<boolean> {
    return (
      (await this.prisma.category.count({
        where: {
          name: name,
          NOT: {
            id: excludecategoryId,
          },
        },
      })) !== 0
    );
  }

  async create(data: { accountId?: number | null; name: string }) {
    const name = data.name?.trim();
    if (!name) {
      throw new Error('Category name cannot be empty');
    }
    if (await this.isCategoryExist(name)) {
      throw new Error('Category name already exist');
    }
    return await this.prisma.$transaction(async (tx) => {
      let validAccountId: number | null = null;
      if (data.accountId) {
        const account = await tx.account.findUnique({
          where: { id: data.accountId },
        });
        if (account) {
          validAccountId = data.accountId;
        }
      }
      const category = await tx.category.create({
        data: {
          name: name,
          accountId: validAccountId,
        },
      });
      return category;
    });
  }

  async setStatus(
    categoryId: number,
    status: CategoryStatus,
  ): Promise<Category> {
    return await this.prisma.category.update({
      data: {
        categoryStatus: status,
      },
      where: {
        id: categoryId,
      },
    });
  }

  async approvedStatus(
    categoryId: number,
    status: CategoryRequestStatus,
  ): Promise<Category> {
    return await this.prisma.category.update({
      data: {
        categoryReqStatus: status,
      },
      where: {
        id: categoryId,
      },
    });
  }

  async delete(categoryId: number): Promise<Category> {
    const findCategoryInGroup = await this.prisma.group.count({
      where: {
        categoryId: categoryId,
      },
    });
    if (findCategoryInGroup) {
      throw new Error(
        `Category cannot be deleted as it is associated with existing groups`,
      );
    }

    return await this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async getAll(options?: {
    search?: string;
    skip?: number;
    take?: number;
    status?: CategoryStatus;
    approvedStatus?: CategoryRequestStatus;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Category[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.CategoryWhereInput = {};

    if (options?.status) {
      where.categoryStatus = options.status;
    }

    if (options?.approvedStatus) {
      where.categoryReqStatus = options.approvedStatus;
    }

    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.CategoryWhereInput[] => [
          {
            name: {
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
    const totalCategories = await this.prisma.category.count({
      where,
    });
    const categories = await this.prisma.category.findMany({
      where,
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    return {
      count: totalCategories,
      skip: pagination.skip,
      take: pagination.take,
      data: categories,
    };
  }
}
