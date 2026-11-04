import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  NotificationAudience,
  NotificationCode,
  StorageService,
  UtilsService,
} from '@Common';
import { PrismaService } from '../prisma';
import {
  CategoryStatus,
  GroupMember,
  GroupStatus,
  Prisma,
  Category,
  Group,
  SharedAssetStatus,
  InterestPaymentStatus,
  NotificationType,
  AssetStatus,
  RWAStatus,
} from '../generated/prisma/client';
import { NotificationService } from '../notification';

@Injectable()
export class GroupService {
  private groupImagePath = 'group/image';
  constructor(
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
  ) {}

  getGroupImageUrl(profileImage: string): string {
    return this.storageService.getFileUrl(profileImage, this.groupImagePath);
  }

  private async get7DayPriceHistory(assetId: number, currentPrice: number) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const trades = await this.prisma.marketplaceTrade.findMany({
      where: {
        assetId,
        tradedAt: { gte: sevenDaysAgo },
      },
      orderBy: { tradedAt: 'asc' },
      select: { pricePerUnit: true, tradedAt: true },
    });

    // Group trades by date — take last price of each day
    const tradePriceByDate = new Map<string, number>();
    for (const trade of trades) {
      const dateStr = trade.tradedAt.toISOString().split('T')[0];
      tradePriceByDate.set(dateStr, Number(trade.pricePerUnit)); // last trade of day wins
    }

    // Fill all 7 days — use currentPrice for days with no trades
    const filledHistory: { date: string; price: number }[] = [];
    let lastKnownPrice = currentPrice;

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];

      if (tradePriceByDate.has(dateStr)) {
        lastKnownPrice = tradePriceByDate.get(dateStr)!;
      }

      filledHistory.push({ date: dateStr, price: lastKnownPrice });
    }

    //  Calculate 7d change
    const startPrice = filledHistory[0]?.price ?? currentPrice;
    const endPrice =
      filledHistory[filledHistory.length - 1]?.price ?? currentPrice;
    const changeAmount = parseFloat((endPrice - startPrice).toFixed(2));
    const change7d =
      startPrice > 0
        ? parseFloat(((changeAmount / startPrice) * 100).toFixed(2))
        : 0;

    return {
      priceHistory: filledHistory,
      change7d,
      changeAmount,
      isPositive: changeAmount >= 0,
    };
  }

  async isGroupExist(title: string, excludeGroupId?: number): Promise<boolean> {
    return (
      (await this.prisma.group.count({
        where: {
          title: title,
          NOT: {
            id: excludeGroupId,
          },
        },
      })) !== 0
    );
  }

  async isCategoryExist(categoryId: number): Promise<Category> {
    const categoryExist = await this.prisma.category.findFirst({
      where: { id: categoryId, categoryStatus: CategoryStatus.Active },
    });
    if (!categoryExist) {
      throw new Error(
        `Category id ${categoryId} does not exists or Category is not Active`,
      );
    }
    return categoryExist;
  }

  async getById(groupId: number): Promise<Group> {
    const checkGroup = await this.prisma.group.findFirst({
      where: {
        id: groupId,
      },
    });
    if (!checkGroup) {
      throw new Error(`Group id ${groupId} does not exists`);
    }
    return checkGroup;
  }

  async create(data: {
    title: string;
    description: string;
    categoryId: number;
    image?: string;
  }) {
    const title = data.title?.trim();
    if (!title) {
      throw new Error('group title cannot be empty');
    }
    if (await this.isGroupExist(title)) {
      throw new Error('Group title already exist');
    }

    if (!(await this.isCategoryExist(data.categoryId))) {
      throw new Error(`Category id ${data.categoryId} does not exists`);
    }
    const users = await this.prisma.account.findMany({ select: { id: true } });
    const userIds = users.map((user) => user.id);
    return await this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          title: title,
          description: data.description,
          categoryId: data.categoryId,
          image: data.image,
        },
      });
      if (data.image) {
        await this.storageService.move(data.image, this.groupImagePath);
      }

      if (userIds.length > 0) {
        await this.notificationService._sendNotification({
          code: NotificationCode.INFORM_TO_USERS,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: userIds,
          groupId: group.id,
          data: {
            groupId: group.id,
            groupName: group.title,
          },
        });
      }

      return group;
    });
  }

  async update(
    groupId: number,
    data: {
      title?: string;
      description?: string;
      categoryId?: number;
      image?: string;
    },
  ): Promise<Group> {
    const title = data.title?.trim();
    const group = await this.getById(groupId);

    if (data.categoryId) {
      if (!(await this.isCategoryExist(data.categoryId))) {
        throw new Error(`Category id  ${data.categoryId} does not exist`);
      }
    }

    return await this.prisma.$transaction(
      async (tx) => {
        const updatedGroup = await tx.group.update({
          data: {
            title: title,
            description: data.description,
            image: data.image,
            categoryId: data.categoryId,
          },
          where: { id: groupId },
        });

        // Remove previous profile image from storage
        if (data.image) {
          if (group.image) {
            await this.storageService.removeFile(
              join(this.groupImagePath, group.image),
            );
          }

          await this.storageService.move(data.image, this.groupImagePath);
        }

        return updatedGroup;
      },
      { timeout: 20000 },
    );
  }

  async setStatus(groupId: number, status: GroupStatus): Promise<Group> {
    return await this.prisma.group.update({
      data: {
        groupStatus: status,
      },
      where: {
        id: groupId,
      },
    });
  }

  async delete(groupId: number): Promise<Group> {
    const findGroup = await this.prisma.groupMember.count({
      where: {
        groupId: groupId,
      },
    });
    if (findGroup) {
      throw new Error(`Group cannot be deleted as users exists.`);
    }

    return await this.prisma.group.delete({
      where: { id: groupId },
    });
  }

  async getIndividualGroupInf(groupId: number): Promise<Group> {
    await this.getById(groupId);
    const group = await this.prisma.group.findUniqueOrThrow({
      where: { id: groupId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            groupMember: true,
            sharedAssetGroups: true,
          },
        },
        // groupMember: {
        //   include: {
        //     account: {
        //       select: {
        //         firstname: true,
        //         lastname: true,
        //         email: true,
        //         mobile: true,
        //       },
        //     },
        //   },
        // },
      },
    });

    return {
      ...group,
      image: group.image ? this.getGroupImageUrl(group.image) : null,
    };
  }

  async getAll(options?: {
    search?: string;
    skip?: number;
    take?: number;
    groupStatus?: GroupStatus;
    accountId?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Group[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.GroupWhereInput = {};

    if (options?.groupStatus) {
      where.groupStatus = options.groupStatus;
    }

    if (options?.accountId) {
      where.groupMember = {
        some: {
          accountId: Number(options.accountId),
        },
      };
    }

    if (search) {
      const buildSearchFilter = (search: string): Prisma.GroupWhereInput[] => [
        {
          title: {
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
    const totalGroups = await this.prisma.group.count({
      where,
    });
    const groups = await this.prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            groupMember: true,
          },
        },
        category: {
          select: {
            name: true,
            categoryStatus: true,
          },
        },
      },
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    const response = await this.utilsService.batchable(
      groups,
      async (group) => {
        return {
          ...group,
          image: group.image ? this.getGroupImageUrl(group.image) : null,
        };
      },
    );
    return {
      count: totalGroups,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async getAllMember(
    groupId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: GroupMember[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.GroupMemberWhereInput = {
      groupId: groupId,
    };

    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.GroupMemberWhereInput => ({
        account: {
          OR: [
            {
              firstname: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastname: {
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
          ],
        },
      });
      const parts = search.split(' ');
      if (parts.length !== 0) {
        where.AND = parts
          .filter((part) => part.trim())
          .map((part) => buildSearchFilter(part.trim()));
      }
    }
    const totalGroups = await this.prisma.groupMember.count({
      where,
    });
    const groups = await this.prisma.groupMember.findMany({
      where,
      include: {
        account: {
          select: {
            firstname: true,
            lastname: true,
            email: true,
            mobile: true,
            type: true,
          },
        },
      },
      orderBy: { id: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
    });
    return {
      count: totalGroups,
      skip: pagination.skip,
      take: pagination.take,
      data: groups,
    };
  }

  async getAllAssets(
    groupId: number,
    accountId: number,
    isAdmin?: boolean,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      status?: SharedAssetStatus;
      assetStatus?: AssetStatus;
      rwaStatus?: RWAStatus;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const assetWhere: Prisma.AssetWhereInput = {
      //  Listed Assets — exclude the current user's own asset entirely;
      //  those are covered by the separate "My Listed Assets" endpoint.
      ...(isAdmin
        ? {}
        : {
            accountId: { not: accountId },
            status: AssetStatus.Available,
          }),

      ...(isAdmin && options?.assetStatus && { status: options.assetStatus }),

      ...(isAdmin &&
        options?.rwaStatus && {
          rwaRequest: { status: options.rwaStatus },
        }),

      ...(search && {
        OR: [
          {
            assetTitle: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const where: Prisma.SharedAssetGroupWhereInput = {
      groupId,
      sharedAsset: {
        //  Only Available + APPROVED assets owned by other users are shown,
        //  independent of the `status` query filter.
        ...(isAdmin
          ? {}
          : {
              sharedById: { not: accountId },
              status: SharedAssetStatus.Approved,
            }),

        ...(isAdmin && options?.status && { status: options.status }),

        asset: assetWhere,
      },
    };

    const [totalGroups, assets, userInterests] = await Promise.all([
      this.prisma.sharedAssetGroup.count({
        where,
      }),
      this.prisma.sharedAssetGroup.findMany({
        where,
        include: {
          sharedAsset: {
            include: {
              asset: {
                include: {
                  meta: true,
                  documents: true,
                  price: true,
                  rwaRequest: {
                    select: {
                      status: true,
                      fractionalizationStatus: true,
                    },
                  },
                  secondaryClub: {
                    select: { id: true, spv: { select: { id: true } } },
                  },
                },
              },
              // interests: true,
              //  select: {
              //  interests: true,
              // },
            },
          },
        },
        orderBy: { id: Prisma.SortOrder.desc },
        skip: pagination.skip,
        take: pagination.take,
      }),

      this.prisma.assetInterest.findMany({
        where: {
          accountId: accountId,
        },
        select: { sharedAssetId: true },
      }),
    ]);

    const validAssets = assets.filter((a) => a.sharedAsset !== null);

    const sharedAssetIds = validAssets.map((a) => a.sharedAsset.id);
    const assetIds = validAssets.map((a) => a.sharedAsset.asset.id);

    const [paidCounts, spvs] = await Promise.all([
      this.prisma.assetInterest.groupBy({
        by: ['sharedAssetId'],
        where: {
          sharedAssetId: { in: sharedAssetIds },
        },
        _count: {
          _all: true,
        },
      }),

      this.prisma.spv.findMany({
        where: { secondaryClub: { assetId: { in: assetIds } } },
        select: { secondaryClub: { select: { assetId: true } } },
      }),
    ]);

    const userPaidSet = new Set(userInterests.map((i) => i.sharedAssetId));

    const countMap = new Map(
      paidCounts.map((c) => [c.sharedAssetId, c._count._all]),
    );

    const spvCreatedAssetIds = new Set(
      spvs.map((s) => s.secondaryClub?.assetId).filter((id) => id != null),
    );

    const finalData = assets.map((item) => {
      const { secondaryClub, ...asset } = item.sharedAsset!.asset;

      return {
        ...item,
        sharedAsset: { ...item.sharedAsset, asset },
        paidInterestCount: countMap.get(item.sharedAsset!.id) || 0,
        isInterested: userPaidSet.has(item.sharedAsset!.id),
        isSecondaryClubCreated: !!secondaryClub,
        secondaryClubId: secondaryClub?.id,
        isSpvCreated: spvCreatedAssetIds.has(asset.id),
      };
    });

    return {
      count: totalGroups,
      skip: pagination.skip,
      take: pagination.take,
      data: finalData,
    };
  }

  async getJoinedGroupsWithAssets(
    accountId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
    },
  ): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const skip = options?.skip || 0;
    const take = options?.take || 10;

    const where: Prisma.GroupWhereInput = {
      groupMember: {
        some: { accountId },
      },
    };

    //  Fetch all matching groups WITHOUT search in where
    const joinedGroups = await this.prisma.group.findMany({
      where,
      include: {
        sharedAssetGroups: {
          include: {
            sharedAsset: {
              include: {
                asset: {
                  include: {
                    meta: true,
                    documents: true,
                    price: true,
                  },
                },
                interests: {
                  where: {
                    accountId,
                    paymentStatus: InterestPaymentStatus.Paid,
                  },
                  select: { paidAt: true },
                },
              },
            },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const allAssets = joinedGroups.flatMap((group) =>
      group.sharedAssetGroups
        .filter((sag) => {
          const sharedAsset = sag.sharedAsset;

          //  Filter approved
          if (sharedAsset.status !== SharedAssetStatus.Approved) return false;

          //  Filter paid
          if (!sharedAsset.interests[0]) return false;

          //  Filter by search on asset title here — not in where clause
          if (search) {
            return sharedAsset.asset.assetTitle
              .toLowerCase()
              .includes(search.toLowerCase());
          }

          return true;
        })
        .map((sag) => {
          const sharedAsset = sag.sharedAsset;
          const userPayment = sharedAsset.interests[0] ?? null;
          const isPaid = !!userPayment;

          const documents = sharedAsset.asset.documents.map((doc) => ({
            ...doc,
            documentUrl: isPaid ? doc.documentUrl : null,
            url: isPaid
              ? this.storageService.resolveFileUrl(doc.documentUrl)
              : null,
          }));

          return {
            groupId: group.id,
            groupTitle: group.title,
            sharedAssetId: sharedAsset.id,
            assetId: sharedAsset.asset.id,
            assetTitle: sharedAsset.asset.assetTitle,
            assetType: sharedAsset.asset.assetType,
            currentOwnerName: sharedAsset.asset.currentOwnerName,
            status: sharedAsset.status,
            tokenAmount: sharedAsset.tokenAmount,
            price: sharedAsset.asset.price,
            meta: sharedAsset.asset.meta,
            documents,
            isPaid,
          };
        }),
    );

    const count = allAssets.length;
    const paginatedAssets = allAssets.slice(skip, skip + take);

    return {
      count,
      skip,
      take,
      data: paginatedAssets,
    };
  }

  async getMarketPlaceAssets(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();

    const skip = options?.skip || 0;
    const take = options?.take || 10;

    // `SharedAsset.assetId` is unique, so querying SharedAsset directly
    // (rather than fanning out from Group -> sharedAssetGroups) gives each
    // asset exactly one row here — previously, an asset shared into
    // multiple groups produced one duplicate marketplace entry per group
    // it belonged to, since the old query flattened per (group, sharedAsset)
    // pair instead of per asset. The marketplace is a single global
    // listing, not a per-group view, so group membership is no longer the
    // basis for the query — `groupShares` is only read to keep populating
    // the existing groupId/groupTitle fields in the response.
    const where: Prisma.SharedAssetWhereInput = {
      status: SharedAssetStatus.Approved,
      groupShares: { some: { sharedBy: null } },
      asset: {
        isMarketplace: true,
        ...(search && {
          assetTitle: {
            contains: search,
            mode: 'insensitive',
          },
        }),
      },
    };

    const [count, sharedAssets] = await Promise.all([
      this.prisma.sharedAsset.count({ where }),
      this.prisma.sharedAsset.findMany({
        where,
        include: {
          asset: {
            include: {
              meta: true,
              price: true,
            },
          },
          groupShares: {
            where: { sharedBy: null },
            take: 1,
            select: {
              groupId: true,
              group: { select: { title: true } },
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
        skip,
        take,
      }),
    ]);

    const paginatedAssets = sharedAssets.map((sharedAsset) => {
      const groupShare = sharedAsset.groupShares[0];

      return {
        groupId: groupShare?.groupId ?? null,

        groupTitle: groupShare?.group.title ?? null,

        sharedAssetId: sharedAsset.id,

        assetId: sharedAsset.asset.id,

        assetTitle: sharedAsset.asset.assetTitle,

        assetType: sharedAsset.asset.assetType,

        currentOwnerName: sharedAsset.asset.currentOwnerName,

        status: sharedAsset.status,

        tokenAmount: sharedAsset.tokenAmount,

        price: sharedAsset.asset.price,

        //  Always true for marketplace
        isPaid: true,

        isMarketplace: sharedAsset.asset.isMarketplace,

        meta: sharedAsset.asset.meta,

        // internal
        _assetId: sharedAsset.asset.id,

        _currentPrice: Number(
          sharedAsset.asset.price?.currentPricePerFraction || 0,
        ),
      };
    });

    //  Add market stats + history
    const assetsWithHistory = await Promise.all(
      paginatedAssets.map(async (asset) => {
        const { _assetId, _currentPrice, ...rest } = asset;

        const marketStat = await this.prisma.assetMarketStat.findUnique({
          where: {
            assetId: _assetId,
          },
        });

        const currentPrice = marketStat
          ? Number(marketStat.currentPrice)
          : _currentPrice;

        const priceData = await this.get7DayPriceHistory(
          _assetId,
          currentPrice,
        );

        return {
          ...rest,

          marketStat: marketStat
            ? {
                currentPrice: marketStat.currentPrice,

                volume24h: marketStat.volume24h,

                units24h: marketStat.units24h,

                highPrice24h: marketStat.highPrice24h,

                lowPrice24h: marketStat.lowPrice24h,

                priceChange24h: marketStat.priceChange24h,
              }
            : null,

          ...priceData,
        };
      }),
    );

    return {
      count,
      skip,
      take,
      data: assetsWithHistory,
    };
  }

  async getTopHighlightedGroup(options?: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: any[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.GroupWhereInput = {
      isHighlighted: true,
      groupStatus: GroupStatus.Active,
    };

    if (search) {
      const buildSearchFilter = (search: string): Prisma.GroupWhereInput[] => [
        {
          title: {
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

    const totalGroups = await this.prisma.group.count({
      where,
    });
    const groups = await this.prisma.group.findMany({
      where,
      include: {
        _count: {
          select: {
            groupMember: true,
          },
        },
      },
      orderBy: { groupMember: { _count: 'desc' } },
      skip: pagination.skip,
      take: pagination.take,
    });

    const response = await this.utilsService.batchable(
      groups,
      async (group) => {
        return {
          ...group,
          image: group.image ? this.getGroupImageUrl(group.image) : null,
          isHighlighted: true,
          memberCount: group._count.groupMember,
        };
      },
    );
    return {
      count: totalGroups,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  // async getMarketPlaceAssets(
  //   accountId: number,
  //   options?: {
  //     search?: string;
  //     skip?: number;
  //     take?: number;
  //   },
  // ): Promise<{
  //   count: number;
  //   skip: number;
  //   take: number;
  //   data: any[];
  // }> {
  //   const search = options?.search?.trim();

  //   const skip = options?.skip || 0;
  //   const take = options?.take || 10;

  //   const where: Prisma.GroupWhereInput = {
  //     groupMember: {
  //       some: { accountId },
  //     },
  //   };

  //   // ✅ Fetch all matching groups
  //   const joinedGroups = await this.prisma.group.findMany({
  //     where,
  //     include: {
  //       sharedAssetGroups: {
  //         where: {
  //           sharedAsset: {
  //             status: SharedAssetStatus.Approved,

  //             asset: {
  //               isMarketplace: true,

  //               ...(search && {
  //                 assetTitle: {
  //                   contains: search,
  //                   mode: 'insensitive',
  //                 },
  //               }),
  //             },
  //           },
  //         },

  //         include: {
  //           sharedAsset: {
  //             include: {
  //               asset: {
  //                 include: {
  //                   meta: true,
  //                   price: true,
  //                 },
  //               },

  //               interests: {
  //                 where: {
  //                   accountId,
  //                   paymentStatus: InterestPaymentStatus.Paid,
  //                 },

  //                 select: {
  //                   paidAt: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },

  //     orderBy: {
  //       id: 'desc',
  //     },
  //   });

  //   // ✅ Flatten assets
  //   const allAssets = joinedGroups.flatMap((group) =>
  //     group.sharedAssetGroups
  //       .map((sag) => {
  //         const sharedAsset = sag.sharedAsset;

  //         const userPayment = sharedAsset.interests[0] ?? null;

  //         const isPaid = !!userPayment;

  //         return {
  //           groupId: group.id,
  //           groupTitle: group.title,
  //           sharedAssetId: sharedAsset.id,
  //           assetId: sharedAsset.asset.id,
  //           assetTitle: sharedAsset.asset.assetTitle,
  //           assetType: sharedAsset.asset.assetType,
  //           currentOwnerName: sharedAsset.asset.currentOwnerName,
  //           status: sharedAsset.status,
  //           tokenAmount: sharedAsset.tokenAmount,
  //           price: sharedAsset.asset.price,
  //           isPaid,
  //           isMarketplace: sharedAsset.asset.isMarketplace,
  //           meta: sharedAsset.asset.meta,
  //           // internal use
  //           _assetId: sharedAsset.asset.id,
  //           _currentPrice: Number(
  //             sharedAsset.asset.price?.currentPricePerFraction || 0,
  //           ),
  //         };
  //       })
  //       .filter((asset) => asset.isPaid),
  //   );

  //   const count = allAssets.length;

  //   //  Asset pagination
  //   const paginatedAssets = allAssets.slice(skip, skip + take);

  //   //  Attach market stats + chart history
  //   const assetsWithHistory = await Promise.all(
  //     paginatedAssets.map(async (asset) => {
  //       const { _assetId, _currentPrice, ...rest } = asset;

  //       //  Market stats
  //       const marketStat = await this.prisma.assetMarketStat.findUnique({
  //         where: {
  //           assetId: _assetId,
  //         },
  //       });

  //       const currentPrice = marketStat
  //         ? Number(marketStat.currentPrice)
  //         : _currentPrice;

  //       //  Price history
  //       const priceData = await this.get7DayPriceHistory(
  //         _assetId,
  //         currentPrice,
  //       );

  //       return {
  //         ...rest,

  //         marketStat: marketStat
  //           ? {
  //               currentPrice: marketStat.currentPrice,
  //               volume24h: marketStat.volume24h,
  //               units24h: marketStat.units24h,
  //               highPrice24h: marketStat.highPrice24h,
  //               lowPrice24h: marketStat.lowPrice24h,
  //               priceChange24h: marketStat.priceChange24h,
  //             }
  //           : null,

  //         ...priceData,
  //       };
  //     }),
  //   );

  //   return {
  //     count,
  //     skip,
  //     take,
  //     data: assetsWithHistory,
  //   };
  // }
}
