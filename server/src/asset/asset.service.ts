import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import {
  AccountType,
  AdminFractionalizationStatus,
  AssetStatus,
  AssetType,
  InterestPaymentStatus,
  MembershipStatus,
  NotificationType,
  OwnershipModel,
  Prisma,
  ReferralApprovalStatus,
  RWAStatus,
  SharedAssetStatus,
  SpvStatus,
  VoteChoice,
} from '../generated/prisma/client';
import { GetAssetListDto, SaveAssetDto, UpdateAssetDto } from './dto';
import {
  AdminNotificationCode,
  NotificationAudience,
  NotificationCode,
  SearchablePaginatedDto,
  StorageService,
  UserType,
} from '@Common';
import {
  AssetFinancialCalculator,
  AssetMetaLike,
  mapAssetDocuments,
  mapAssetMeta,
} from './asset-financial';
import { NotificationService } from '../notification';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityService,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity';
import { AssetSubType } from 'prisma/seeds';

export interface AssetFinancialInput {
  marketValue: number;
  netOperatingIncome: number;
  expectedAppreciationPercent: number;
  totalFractions: number;
  currentPricePerFraction: number;
}

// Which rejected RWA stage(s) to resubmit is determined by which of these
// three fields the caller includes in the updateAsset request body — the
// same fields RWARequest stores the per-stage status in.
const STAGE_FIELD_CONFIG: Record<
  'statusForLegal' | 'statusForValuation' | 'statusForDueDiligence',
  {
    rejectedStatus: RWAStatus;
    rejectionReasonField:
      | 'legalRejectionReason'
      | 'valuationRejectionReason'
      | 'dueDiligenceRejectionReason';
  }
> = {
  statusForLegal: {
    rejectedStatus: RWAStatus.LegalRejected,
    rejectionReasonField: 'legalRejectionReason',
  },
  statusForValuation: {
    rejectedStatus: RWAStatus.ValuationRejected,
    rejectionReasonField: 'valuationRejectionReason',
  },
  statusForDueDiligence: {
    rejectedStatus: RWAStatus.DueDiligenceRejected,
    rejectionReasonField: 'dueDiligenceRejectionReason',
  },
};

const ALL_RWA_STAGE_FIELDS = Object.keys(STAGE_FIELD_CONFIG) as Array<
  keyof typeof STAGE_FIELD_CONFIG
>;

// Legacy fallback map, used only when the caller doesn't send any of
// statusForLegal/statusForValuation/statusForDueDiligence. Kept for backward
// compatibility with any older client still relying on the single shared
// rwaRequest.status column.
const REJECT_STAGE_UPDATE: Partial<
  Record<RWAStatus, Prisma.RWARequestUpdateInput>
> = {
  [RWAStatus.Rejected]: {
    rejectionReason: null,
  },
  [RWAStatus.LegalRejected]: {
    statusForLegal: RWAStatus.Submitted,
    legalRejectionReason: null,
  },
  [RWAStatus.ValuationRejected]: {
    statusForValuation: RWAStatus.Submitted,
    valuationRejectionReason: null,
  },
  [RWAStatus.DueDiligenceRejected]: {
    statusForDueDiligence: RWAStatus.Submitted,
    dueDiligenceRejectionReason: null,
  },
};

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetFinancialCalculator: AssetFinancialCalculator,
    private readonly notificationService: NotificationService,
    private readonly storageService: StorageService,
    private readonly activityService: ActivityService,
  ) {}

  FREE_DOCUMENT_TYPES = ['ASSET_IMAGE', 'ASSET_VIDEO'];

  getMetaNumber(meta: AssetMetaLike[], key: string): number {
    const rawValue = meta.find((m) => m.metaKey === key)?.metaValue;

    if (rawValue === null || rawValue === undefined) {
      return 0;
    }

    const num = Number(rawValue);
    return isNaN(num) ? 0 : num;
  }

  private validateKyc(account: any) {
    if (!account?.kyc && !account?.companyKyc) {
      throw new Error('KYC not submitted');
    }

    if (account?.companyKyc) {
      if (account.companyKyc.kybStatus === 'Draft')
        throw new Error('KYB not submitted');

      if (account.companyKyc.kycStatus === 'Draft')
        throw new Error('KYC not submitted');

      if (account.companyKyc.kybStatus === 'Submitted')
        throw new Error('KYB not approved');

      if (account.companyKyc.kycStatus === 'Submitted')
        throw new Error('KYC not approved');

      if (account.companyKyc.kybStatus === 'Rejected')
        throw new Error('KYB is rejected');

      if (account.companyKyc.kycStatus === 'Rejected')
        throw new Error('KYC is rejected');
    }

    if (account?.kyc) {
      if (account.kyc.status === 'Draft') throw new Error('KYC not submitted');

      if (account.kyc.status === 'Submitted')
        throw new Error('KYC not approved');

      if (account.kyc.status === 'Rejected') throw new Error('KYC is rejected');
    }
  }

  async getAllAssets(query: GetAssetListDto) {
    const REQUIRED_META_KEYS = [
      'marketValue',
      'netOperationalIncome',
      'expectedAppreciationPercentage',
      'totalFractions',
    ];

    const where: Prisma.AssetWhereInput = {
      // status: AssetStatus.Available,
      // isVisible: true,
    };

    if (query.soldout !== query.available) {
      where.isSoldOut = query.soldout ?? false;
    }

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          accountId: true,
          assetSubType: true,
          assetTitle: true,
          assetType: true,
          createdAt: true,
          isSoldOut: true,
          isVerified: true,
          currentOwnerName: true,
          ownershipModel: true,
          totalFractions: true,
          assetAppreciation: true,
          soldFractions: true,
          status: true,
          remainingFractions: true,
          updatedAt: true,
          price: true,
          propertyInterest: {
            select: {
              title: true,
              description: true,
              icon: true,
            },
          },
          meta: {
            where: {
              metaKey: {
                in: REQUIRED_META_KEYS,
              },
            },
            select: {
              metaKey: true,
              metaValue: true,
            },
          },
          documents: {
            take: 1,
          },
        },
        orderBy: {
          createdAt: query.newlyAdded === false ? 'asc' : 'desc',
        },
        skip: query.skip ?? 0,
        take: query.take ?? 10,
      }),
      this.prisma.asset.count({ where }),
    ]);

    const data = assets.map((asset) => {
      const marketValue = this.getMetaNumber(asset.meta, 'marketValue');
      const netOperationalIncome = this.getMetaNumber(
        asset.meta,
        'netOperationalIncome',
      );
      const expectedAppreciationPercentage = this.getMetaNumber(
        asset.meta,
        'expectedAppreciationPercentage',
      );

      const financials = this.assetFinancialCalculator.calculate({
        marketValue,
        netOperationalIncome,
        expectedAppreciationPercentage,
        totalFractions: asset.totalFractions,
        currentPricePerFraction:
          Number(asset.price?.currentPricePerFraction) ?? 0,
      });

      return {
        ...asset,
        documents: asset.documents.map((doc) => ({
          ...doc,
          url: doc.documentUrl
            ? this.storageService.resolveFileUrl(doc.documentUrl)
            : null,
        })),
        financials,
      };
    });

    return {
      data,
      total,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
    };
  }

  async getAssets(
    accountId: number,
    query: {
      skip?: number;
      take?: number;
      search?: string;
      filters: {
        assetStatus?: AssetStatus;
        rwaStatus?: RWAStatus;
        assetownerStatus?: ReferralApprovalStatus;
      };
    },
  ) {
    const search = query?.search?.trim();
    const REQUIRED_META_KEYS = [
      'marketValue',
      'netOperationalIncome',
      'expectedAppreciationPercentage',
      'totalFractions',
      'state',
      'city',
    ];
    const where: Prisma.AssetWhereInput = {
      OR: [
        {
          accountId: accountId,
        },
        {
          assetOwnerInvite: {
            brokerId: accountId,
          },
        },
      ],
    };

    if (query.filters.assetStatus) {
      where.status = query.filters.assetStatus;
    }

    if (query.filters.rwaStatus) {
      where.rwaRequest = {
        is: {
          status: query.filters.rwaStatus,
        },
      };
    }

    if (query.filters.assetownerStatus) {
      where.ownerStatus = query.filters.assetownerStatus;
    }

    if (search) {
      const buildSearchFilter = (search: string): Prisma.AssetWhereInput[] => [
        {
          assetTitle: {
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

    const brokerReferredAssetsCount = await this.prisma.asset.count({
      where: {
        OR: [
          {
            assetOwnerInvite: {
              brokerId: accountId,
            },
          },
          {
            accountId: accountId,
            isBrokerReferred: true,
          },
        ],
      },
    });

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          accountId: true,
          assetSubType: true,
          assetTitle: true,
          assetType: true,
          createdAt: true,
          status: true,
          isVisible: true,
          isVerified: true,
          isSoldOut: true,
          currentOwnerName: true,
          isBrokerReferred: true,
          ownerStatus: true,
          ownershipModel: true,
          totalFractions: true,
          soldFractions: true,
          remainingFractions: true,
          assetAppreciation: true,
          updatedAt: true,
          price: true,
          updateAsset: true,
          steps: true,
          propertyInterest: {
            select: {
              icon: true,
              title: true,
              description: true,
            },
          },
          rwaRequest: {
            select: {
              status: true,
              statusForLegal: true,
              statusForValuation: true,
              statusForDueDiligence: true,
              legalRejectionReason: true,
              valuationRejectionReason: true,
              dueDiligenceRejectionReason: true,
              rejectionReason: true,
              trusteeComment: true,
              fractionalizationStatus: true,
              trusteeId: true,
            },
          },
          meta: {
            where: {
              metaKey: {
                in: REQUIRED_META_KEYS,
              },
            },
            select: {
              metaKey: true,
              metaType: true,
              metaValue: true,
            },
          },

          documents: {
            take: 1,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: query.skip ?? 0,
        take: query.take ?? 10,
      }),

      this.prisma.asset.count({ where }),
    ]);

    const data = await Promise.all(
      assets.map(async (asset) => {
        const price = await this.prisma.assetPrice.findUnique({
          where: { assetId: asset.id },
          select: {
            currentPricePerFraction: true,
          },
        });

        const marketValue = this.getMetaNumber(asset.meta, 'marketValue');
        const netOperationalIncome = this.getMetaNumber(
          asset.meta,
          'netOperationalIncome',
        );
        const expectedAppreciationPercentage = this.getMetaNumber(
          asset.meta,
          'expectedAppreciationPercentage',
        );

        const financials = this.assetFinancialCalculator.calculate({
          marketValue,
          netOperationalIncome,
          expectedAppreciationPercentage,
          totalFractions: asset.totalFractions,
          currentPricePerFraction: Number(price?.currentPricePerFraction) ?? 0,
        });

        return {
          ...asset,
          currentPricePerFraction: Number(price?.currentPricePerFraction) ?? 0,
          isFractionalized: (asset?.totalFractions ?? 0) > 0,
          documents: asset.documents.map((doc) => ({
            ...doc,
            url: doc.documentUrl
              ? this.storageService.resolveFileUrl(doc.documentUrl)
              : null,
          })),
          financials,
        };
      }),
    );

    return {
      count: total,
      brokerReferredAssetsCount,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
      data,
    };
  }

  async getMyAssetDocumentsByDueDiligenceStatus(
    accountId: number,
    query: {
      status?:
        | typeof RWAStatus.DueDiligence
        | typeof RWAStatus.DueDiligenceRejected;
      search?: string;
      sortBy?: 'uploadedAt' | 'documentName' | 'documentType';
      order?: 'asc' | 'desc';
      skip?: number;
      take?: number;
    },
  ) {
    const search = query.search?.trim();
    const statuses = query.status
      ? [query.status]
      : [RWAStatus.DueDiligence, RWAStatus.DueDiligenceRejected];

    const where: Prisma.AssetWhereInput = {
      accountId,
      rwaRequest: { is: { status: { in: statuses } } },
    };

    if (search) {
      where.OR = [
        { assetTitle: { contains: search, mode: 'insensitive' } },
        {
          documents: {
            some: {
              OR: [
                { documentName: { contains: search, mode: 'insensitive' } },
                { documentType: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const documentsOrderBy: Prisma.AssetDocumentOrderByWithRelationInput = {
      [query.sortBy ?? 'uploadedAt']: query.order ?? 'desc',
    };

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          assetTitle: true,
          rwaRequest: {
            select: {
              status: true,
              dueDiligenceRejectionReason: true,
              approvedAt: true,
              rejectedAt: true,
            },
          },
          documents: { orderBy: documentsOrderBy },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip ?? 0,
        take: query.take ?? 10,
      }),
      this.prisma.asset.count({ where }),
    ]);

    const data = assets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.assetTitle ?? null,
      status: asset.rwaRequest?.status ?? null,
      rejectionReason: asset.rwaRequest?.dueDiligenceRejectionReason ?? null,
      reviewedAt:
        asset.rwaRequest?.rejectedAt ?? asset.rwaRequest?.approvedAt ?? null,
      documents: asset.documents.map((doc) => ({
        documentId: doc.id,
        documentName: doc.documentName,
        documentType: doc.documentType,
        documentUrl: doc.documentUrl
          ? this.storageService.resolveFileUrl(doc.documentUrl)
          : null,
        createdAt: doc.uploadedAt,
      })),
    }));

    return {
      count: total,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
      data,
    };
  }

  async getAllAssetsList(query: {
    skip?: number;
    take?: number;
    search?: string;
    filters: {
      rwaStatus?: RWAStatus;
      fractionalizationStatus?: AdminFractionalizationStatus;
      assetStatus?: AssetStatus;
      isVisible?: boolean;
      newlyAdded?: boolean;
      steps?: string;
      assetSubType?: AssetSubType;
      assetType?: AssetType;
      trusteeId?: number;
      fromDate?: string;
      toDate?: string;
      groupId?: number;
      accountId?: number;
    };
  }) {
    const REQUIRED_META_KEYS = [
      'marketValue',
      'netOperationalIncome',
      'expectedAppreciationPercentage',
      'totalFractions',
      'state',
      'city',
    ];

    const skip = query.skip ?? 0;
    const take = query.take ?? 10;

    // Assets the user has already paid interest in — hide these.
    // Pending/failed submissions don't hide the asset, since they aren't
    // final yet (the user may still want to browse or resubmit).
    const interestedSharedAssetIds = query.filters.accountId
      ? (
          await this.prisma.assetInterest.findMany({
            where: {
              accountId: query.filters.accountId,
              paymentStatus: InterestPaymentStatus.Paid,
            },
            select: { sharedAssetId: true },
          })
        ).map((i) => i.sharedAssetId)
      : [];

    // ─── Build Where Clause ───────────────────────────
    const where: Prisma.AssetWhereInput = {
      // Date filter
      ...(query.filters.fromDate || query.filters.toDate
        ? {
            createdAt: {
              ...(query.filters.fromDate && {
                gte: new Date(query.filters.fromDate),
              }),
              ...(query.filters.toDate && {
                lte: new Date(query.filters.toDate),
              }),
            },
          }
        : {}),

      // Simple filters
      ...(query.filters.assetStatus && { status: query.filters.assetStatus }),
      ...(query.filters.isVisible !== undefined && {
        isVisible: query.filters.isVisible,
      }),
      ...(query.filters.assetType && { assetType: query.filters.assetType }),
      ...(query.filters.assetSubType && {
        assetSubType: query.filters.assetSubType,
      }),
      ...(query.filters.groupId && {
        tempGroupIds: { has: query.filters.groupId },
      }),
      ...(query.filters.steps && { steps: query.filters.steps }),
      // Exclude the requesting user's own assets — show only others'
      ...(query.filters.accountId && {
        accountId: { not: query.filters.accountId },
      }),
      //  Hide assets the user has already expressed interest in
      ...(interestedSharedAssetIds.length > 0 && {
        NOT: {
          sharedAsset: { id: { in: interestedSharedAssetIds } },
        },
      }),
      // Search
      ...(query.search && {
        assetTitle: { contains: query.search, mode: 'insensitive' },
      }),

      //  RWA filters
      ...((query.filters.rwaStatus ||
        query.filters.fractionalizationStatus ||
        query.filters.trusteeId) && {
        rwaRequest: {
          ...(query.filters.rwaStatus && { status: query.filters.rwaStatus }),
          ...(query.filters.fractionalizationStatus && {
            fractionalizationStatus: query.filters.fractionalizationStatus,
          }),
          ...(query.filters.trusteeId && {
            trusteeId: query.filters.trusteeId,
          }),
        },
      }),
    };

    // ─── Parallel DB Calls ────────────────────────────
    // Run count and findMany in parallel
    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          accountId: true,
          assetSubType: true,
          assetTitle: true,
          assetType: true,
          createdAt: true,
          status: true,
          isVisible: true,
          tempGroupIds: true,
          isVerified: true,
          isSoldOut: true,
          isMarketplace: true,
          currentOwnerName: true,
          ownershipModel: true,
          totalFractions: true,
          soldFractions: true,
          remainingFractions: true,
          assetAppreciation: true,
          updatedAt: true,
          updateAsset: true,
          steps: true,
          propertyInterest: {
            select: { title: true, description: true, icon: true },
          },
          rwaRequest: {
            select: {
              status: true,
              statusForLegal: true,
              statusForValuation: true,
              statusForDueDiligence: true,
              rejectionReason: true,
              trusteeComment: true,
              fractionalizationStatus: true,
              trusteeId: true,
            },
          },
          meta: {
            where: { metaKey: { in: REQUIRED_META_KEYS } },
            select: { metaKey: true, metaType: true, metaValue: true },
          },
          documents: { take: 1 },
          sharedAsset: { select: { id: true, tokenAmount: true } },
          secondaryClub: {
            select: { id: true, spv: { select: { name: true } } },
          },
          //  Include price directly — removes N+1 query
          price: {
            select: {
              currentPricePerFraction: true,
              initialPricePerFraction: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.asset.count({ where }),
    ]);

    // ─── Batch Interest Check ─────────────────────────
    //  Single query for all interests — no loop
    const sharedAssetIds = assets
      .map((a) => a.sharedAsset?.id)
      .filter((id): id is number => id !== undefined);

    const userPaymentStatusBySharedAssetId = new Map<
      number,
      InterestPaymentStatus
    >();

    if (query.filters.accountId && sharedAssetIds.length > 0) {
      const userInterests = await this.prisma.assetInterest.findMany({
        where: {
          accountId: query.filters.accountId,
          sharedAssetId: { in: sharedAssetIds },
        },
        select: { sharedAssetId: true, paymentStatus: true },
      });
      userInterests.forEach((i) =>
        userPaymentStatusBySharedAssetId.set(i.sharedAssetId, i.paymentStatus!),
      );
    }

    // ─── Map Data — No DB calls inside loop ───────────
    // All data already fetched — pure computation only
    const data = assets.map((asset) => {
      const marketValue = this.getMetaNumber(asset.meta, 'marketValue');
      const netOperationalIncome = this.getMetaNumber(
        asset.meta,
        'netOperationalIncome',
      );
      const expectedAppreciationPercentage = this.getMetaNumber(
        asset.meta,
        'expectedAppreciationPercentage',
      );

      const currentPricePerFraction = Number(
        asset.price?.currentPricePerFraction ?? 0,
      );

      const financials = this.assetFinancialCalculator.calculate({
        marketValue,
        netOperationalIncome,
        expectedAppreciationPercentage,
        totalFractions: asset.totalFractions,
        currentPricePerFraction,
      });

      return {
        ...asset,
        price: undefined, //  remove nested price
        secondaryClub: undefined, //  remove nested relation, expose flag below
        currentPricePerFraction,
        initialPricePerFraction: Number(
          asset.price?.initialPricePerFraction ?? 0,
        ),
        isInterest: asset.sharedAsset
          ? userPaymentStatusBySharedAssetId.get(asset.sharedAsset.id) ===
            InterestPaymentStatus.Paid
          : false,
        paymentStatus: asset.sharedAsset
          ? (userPaymentStatusBySharedAssetId.get(asset.sharedAsset.id) ?? null)
          : null,
        isSecondaryClubCreated: !!asset.secondaryClub,
        spvName: asset.secondaryClub?.spv?.name ?? null,
        documents: asset.documents.map((doc) => ({
          ...doc,
          url: doc.documentUrl
            ? this.storageService.resolveFileUrl(doc.documentUrl)
            : null,
        })),
        financials,
      };
    });

    return { count: total, skip, take, data };
  }

  private normalizeValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === 'string') {
      return value.trim().toLowerCase();
    }

    return JSON.stringify(value);
  }

  compare(
    incoming: Record<string, any>,
    invited: Record<string, any>,
  ): {
    match: boolean;
    mismatchKeys: string[];
  } {
    const mismatchKeys: string[] = [];

    for (const key of Object.keys(invited)) {
      const incomingValue = this.normalizeValue(incoming[key]);
      const invitedValue = this.normalizeValue(invited[key]);
      console.log('data', incomingValue, invitedValue);
      if (incomingValue !== invitedValue) {
        mismatchKeys.push(key);
      }
    }

    return {
      match: mismatchKeys.length === 0,
      mismatchKeys,
    };
  }

  isSameProperty(
    incoming: Record<string, any>,
    invited: Record<string, any>,
  ): {
    isMatch: boolean;
    mismatchKeys?: string[];
  } {
    console.log('dasdsta', incoming, invited);
    const { match, mismatchKeys } = this.compare(incoming, invited);
    console.log('dassta', match, mismatchKeys);

    return {
      isMatch: match,
      mismatchKeys,
    };
  }

  async createAsset(
    accountId: number,
    accountType: AccountType | UserType,
    data: CreateAssetDto,
  ) {
    try {
      if (accountType === AccountType.CorporateInvestor) {
        throw new Error('Corporate investor cannot create asset');
      }
      const checkUserExistsInGroup = await this.prisma.groupMember.findFirst({
        where: { accountId: accountId },
      });

      if (!checkUserExistsInGroup && accountType !== UserType.Admin) {
        throw new Error('Please join the group first to continue');
      }
      const {
        basicInfo: {
          assetType,
          assetTitle,
          currentOwnerName,
          isVerified,
          ownershipModel,
          ownershipModelOther,
          mapUrl,
        },
        ownerDetails,
        meta,
        documents,
        whyInvested,
      } = data;

      if (
        ownershipModel === OwnershipModel.Others &&
        !ownershipModelOther?.trim()
      ) {
        throw new Error(
          'ownershipModelOther is required when ownershipModel is Others',
        );
      }

      if (accountType === AccountType.Business) {
        throw new Error(
          'This action is restricted to individual accounts. Business accounts cannot perform this operation.',
        );
      }

      const rwaStatus =
        accountType === UserType.Admin
          ? RWAStatus.Approved
          : accountType === AccountType.Broker
            ? RWAStatus.Draft
            : RWAStatus.Submitted;

      const result = await this.prisma.$transaction(async (tx) => {
        const asset = await tx.asset.create({
          data: {
            accountId,
            assetType,
            assetTitle: assetTitle.trim(),
            currentOwnerName: currentOwnerName.trim(),
            ownershipModel,
            ownershipModelOther:
              ownershipModel === OwnershipModel.Others
                ? ownershipModelOther?.trim()
                : null,
            tempGroupIds: data.groupIds ?? [],
            status: AssetStatus.Draft,
            steps: '1',
            ownerStatus:
              accountType === AccountType.Broker
                ? ReferralApprovalStatus.Pending
                : ReferralApprovalStatus.Approved,
            isVisible: false,
            isVerified: isVerified || false,
            mapUrl: mapUrl ?? null,
            isBrokerReferred: accountType === AccountType.Broker,
            ...(ownerDetails
              ? {
                  assetOwner: {
                    create: {
                      name: ownerDetails.name,
                      mobile: ownerDetails.mobile,
                      email: ownerDetails.email,
                    },
                  },
                }
              : {}),
            ...(meta?.length ? { meta: { create: mapAssetMeta(meta) } } : {}),
            ...(documents?.length
              ? { documents: { create: mapAssetDocuments(documents) } }
              : {}),
            ...(whyInvested?.length
              ? {
                  propertyInterest: {
                    create: await Promise.all(
                      whyInvested.map(async (item) => {
                        const icon = await tx.icons.findUnique({
                          where: { id: Number(item.icon) },
                        });

                        if (!icon) {
                          throw new Error(
                            `Icon with id ${item.icon} not found`,
                          );
                        }

                        return {
                          iconId: Number(item.icon),
                          icon: icon.url,
                          title: item.title,
                          description: item.description,
                        };
                      }),
                    ),
                  },
                }
              : {}),
          },
          include: {
            meta: true,
            documents: true,
            propertyInterest: true,
            assetOwner: true,
          },
        });

        const rwaRequest = await tx.rWARequest.create({
          data: {
            assetId: asset.id,
            status: rwaStatus,
            statusForLegal: rwaStatus,
            statusForValuation: rwaStatus,
            statusForDueDiligence: rwaStatus,
            fractionalizationStatus: AdminFractionalizationStatus.Pending,
            ...(accountType === UserType.Admin
              ? {
                  approvedAt: new Date(),
                }
              : {}),
          },
        });
        if (data.createGroup === true) {
          await tx.sharedAsset.create({
            data: {
              assetId: asset.id,
              sharedById: accountId,
              submittedToGroupIds: data.groupIds ?? [],
              groupShares: {
                create: (data.groupIds ?? []).map((groupId) => ({
                  groupId,
                })),
              },
            },
          });
        }

        await this.activityService.createLog({
          type:
            accountType === AccountType.Broker
              ? ActivityType.ASSET_CREATED
              : ActivityType.ASSET_ONBOARDING,
          actorType: ACTOR_TYPE_MAP[accountType] ?? ActivityActorType.SYSTEM,
          actorId: accountId,
          entityType: ActivityEntityType.ASSET,
          entityId: asset.id,
          targetId: accountId,
          label:
            accountType === AccountType.Broker
              ? 'Asset created'
              : 'Asset onboarded to RWA process',
          metadata: {
            message:
              accountType === AccountType.Broker
                ? 'Asset created'
                : 'Asset onboarded to RWA process',
          },
        });

        return { asset, rwaRequest };
      });

      try {
        const trusteeIds = ownerDetails
          ? (
              await this.prisma.account.findMany({
                where: { type: AccountType.Trustee },
                select: { id: true },
              })
            ).map((t) => t.id)
          : [];

        await this.notificationService._sendNotification({
          code:
            accountType === AccountType.Broker
              ? AdminNotificationCode.RWA_DRAFTED
              : AdminNotificationCode.RWA_SUBMITTED,
          audience: trusteeIds.length
            ? NotificationAudience.BOTH
            : NotificationAudience.ADMIN,
          userIds: trusteeIds,
          type: NotificationType.Informational,
          createdById: accountId,
          data: {
            assetId: result.asset.id,
            assetTitle: result.asset.assetTitle,
            rwaRequestId: result.rwaRequest.id,
            groupId: data.groupIds?.[0],
            groupIds: data.groupIds,
          },
        });
      } catch (notificationError) {
        console.error('Notification failed', notificationError);
      }

      return result.asset;
    } catch (error) {
      console.error('Create asset failed', {
        accountId,
        error,
      });

      throw error;
    }
  }

  async updateRwaRequestStatusByOwner(
    assetOwnerId: number,
    assetId: number,
    status: ReferralApprovalStatus,
  ) {
    if (!assetOwnerId) {
      throw new Error('Asset Owner id is required');
    }

    const account = await this.prisma.account.findUnique({
      where: { id: assetOwnerId },
      include: { kyc: true, companyKyc: true },
    });

    this.validateKyc(account);

    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { rwaRequest: true },
    });
    const brokerId = await this.prisma.assetOwnerInvite.findFirst({
      where: { assetId: assetId },
      select: { id: true, brokerId: true },
    });
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset?.ownerStatus === ReferralApprovalStatus.Approved) {
      throw new Error('Asset already approved');
    }

    if (asset?.ownerStatus === ReferralApprovalStatus.Rejected) {
      throw new Error('Asset already rejected');
    }

    await this.prisma.asset.update({
      where: {
        id: assetId,
        accountId: assetOwnerId,
      },
      data: {
        ownerStatus: status,
        updatedAt: new Date(),
      },
    });

    await this.prisma.assetOwnerInvite.update({
      where: {
        assetId: assetId,
        assetOwnerId: assetOwnerId,
      },
      data: {
        assetOwnerStatus: status,
        updatedAt: new Date(),
      },
    });

    await this.prisma.rWARequest.update({
      where: {
        assetId: assetId,
      },
      data: {
        status:
          status === ReferralApprovalStatus.Approved
            ? RWAStatus.Submitted
            : RWAStatus.Rejected,
        updatedAt: new Date(),
      },
    });

    await this.activityService.createLog({
      type: ActivityType.ASSET_ONBOARDING,
      actorType: ActivityActorType.ASSET_OWNER,
      actorId: assetOwnerId,
      entityType: ActivityEntityType.ASSET,
      entityId: asset?.id,
      targetId: assetOwnerId,
      label: 'Asset onboarded to RWA process',
      metadata: {
        message: 'Asset onboarded to RWA process',
      },
    });
    if (status === ReferralApprovalStatus.Approved) {
      try {
        await this.notificationService._sendNotification({
          code: AdminNotificationCode.INFORM_TO_BROKER_AND_ADMIN,
          audience: NotificationAudience.BOTH,
          type: NotificationType.Informational,
          userIds: [brokerId!.brokerId],
          data: {
            brokerId: brokerId?.brokerId,
            assetTitle: asset?.assetTitle,
            rwaRequestId: asset?.rwaRequest?.id,
          },
        });
      } catch (notificationError) {
        console.error('Notification failed', notificationError);
      }
    } else {
      try {
        await this.notificationService._sendNotification({
          code: AdminNotificationCode.INFORM_TO_BROKER_AND_ADMIN,
          audience: NotificationAudience.BOTH,
          type: NotificationType.Informational,
          userIds: [brokerId!.brokerId],
          data: {
            brokerId: brokerId?.brokerId,
            assetTitle: asset?.assetTitle,
            rwaRequestId: asset?.rwaRequest?.id,
          },
        });
      } catch (notificationError) {
        console.error('Notification failed', notificationError);
      }
    }
    return {
      message: 'RWA Request status updated successfully',
    };
  }

  async getAssetById(
    type: AccountType | UserType,
    accountId: number,
    id: number,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        meta: true,
        savedAssets: true,
        documents: true,
        price: true,
        propertyInterest: {
          select: {
            iconId: true,
            title: true,
            description: true,
            icon: true,
          },
        },
        assetOwner: true,
        rwaRequest: true,
        assetPurchases: {
          where:
            type === AccountType.CorporateInvestor
              ? { accountId: accountId }
              : {},
          select: {
            accountId: true,
            fractions: true,
            totalAmount: true,
          },
        },
        sharedAsset: {
          select: {
            tokenAmount: true,
          },
        },
        fractionsConsents: {
          where: { accountId },
          select: {
            buyerConsent: true,
            rejectionReason: true,
          },
        },
      },
    });

    if (!asset) {
      throw new Error(`Asset with id ${id} not found`);
    }
    const allPurchases =
      type === AccountType.CorporateInvestor
        ? await this.prisma.assetPurchase.findMany({
            where: { assetId: id },
            select: { accountId: true, fractions: true, totalAmount: true },
          })
        : asset.assetPurchases; // AssetOwner already has all purchases

    const totalSoldAmount = allPurchases.reduce(
      (sum, p) => sum + Number(p.totalAmount),
      0,
    );
    const totalSoldFractions = allPurchases.reduce(
      (sum, p) => sum + p.fractions,
      0,
    );
    const totalBuyersCount = new Set(allPurchases.map((p) => p.accountId)).size;

    const sharedAsset = await this.prisma.sharedAsset.findUnique({
      where: { assetId: id },
    });
    //  Get interestCount and isInterested in parallel
    const [interestCount, userInterest, paymentPaid] = sharedAsset
      ? await Promise.all([
          this.prisma.assetInterest.count({
            where: {
              sharedAssetId: sharedAsset.id,
              // paymentStatus: InterestPaymentStatus.Paid,
            },
          }),
          this.prisma.assetInterest.findFirst({
            where: {
              sharedAssetId: sharedAsset.id,
              accountId: accountId,
              // paymentStatus: InterestPaymentStatus.Paid,
            },
          }),
          this.prisma.assetInterest.findFirst({
            where: {
              sharedAssetId: sharedAsset.id,
              accountId: accountId,
              paymentStatus: InterestPaymentStatus.Paid,
              isPayment: true,
            },
          }),
        ])
      : [0, null, null];

    const [myVote, votingClub] = userInterest?.secondaryClubId
      ? await Promise.all([
          this.prisma.vote.findUnique({
            where: {
              secondaryClubId_accountId: {
                secondaryClubId: userInterest.secondaryClubId,
                accountId,
              },
            },
          }),
          this.prisma.secondaryClubs.findUnique({
            where: { id: userInterest.secondaryClubId },
            select: { startDate: true, endDate: true },
          }),
        ])
      : [null, null];

    const group = asset?.tempGroupIds?.[0]
      ? await this.prisma.group.findUnique({
          where: { id: asset.tempGroupIds[0] },
          select: { title: true },
        })
      : null;

    // // total sold amount
    // const totalSoldAmount = asset.assetPurchases.reduce(
    //   (sum, p) => sum + Number(p.totalAmount),
    //   0,
    // );

    // // total sold fractions
    // const totalSoldFractions = asset.assetPurchases.reduce(
    //   (sum, p) => sum + p.fractions,
    //   0,
    // );

    // // unique buyers count
    // const totalBuyersCount = new Set(
    //   asset.assetPurchases.map((p) => p.accountId),
    // ).size;
    const brokerReferral = await this.prisma.assetOwnerInvite.findFirst({
      where: {
        assetId: id,
        OR: [{ assetOwnerId: accountId }, { brokerId: accountId }],
      },
    });
    const isReferredBroker = !!brokerReferral;
    const isAssetOwner = asset.accountId === accountId;
    const canAdminView =
      type === UserType.Admin ||
      type === AccountType.Trustee ||
      type === AccountType.Broker;

    const documents = asset.documents.map((doc) => {
      const isFreeDocument = this.FREE_DOCUMENT_TYPES.includes(
        doc.documentType,
      );
      const canViewUrl =
        canAdminView ||
        isAssetOwner ||
        isReferredBroker ||
        !!paymentPaid ||
        isFreeDocument;

      return {
        ...doc,
        documentUrl: canViewUrl ? doc.documentUrl : null,
        url: canViewUrl
          ? this.storageService.resolveFileUrl(doc.documentUrl)
          : null,
      };
    });

    const isFav = await this.prisma.savedAsset.findUnique({
      where: {
        accountId_assetId: {
          accountId,
          assetId: id,
        },
      },
    });

    const spv = await this.prisma.spv.findFirst({
      where: { secondaryClub: { assetId: id } },
      select: { id: true, status: true },
    });

    const isSpvMember = spv
      ? !!(await this.prisma.spvMember.findUnique({
          where: { spvId_accountId: { spvId: spv.id, accountId } },
        }))
      : false;

    const isVotingDisabled = isSpvMember && spv?.status === SpvStatus.Disabled;

    const financials = this.assetFinancialCalculator.calculate({
      marketValue: this.getMetaNumber(asset.meta, 'marketValue'),
      netOperationalIncome: this.getMetaNumber(
        asset.meta,
        'netOperationalIncome',
      ),
      expectedAppreciationPercentage: this.getMetaNumber(
        asset.meta,
        'expectedAppreciationPercentage',
      ),
      totalFractions: asset.totalFractions,
      currentPricePerFraction:
        Number(asset.price?.currentPricePerFraction) ?? 0,
    });

    const propertyInterest = asset.propertyInterest.map((pi) => ({
      ...pi,
      icon: this.storageService.resolveFileUrl(pi.icon),
    }));

    return {
      ...asset,
      isFavourite: isFav?.isFavourite ?? false,
      documents,
      propertyInterest,
      isDocumentLocked: !isAssetOwner && !paymentPaid && !isReferredBroker,
      totalSoldAmount,
      totalSoldFractions,
      totalBuyersCount,
      financials,
      interestCount,
      isInterested: !!userInterest,
      isPaid: !!paymentPaid,
      paymentStatus: userInterest?.paymentStatus ?? null,
      rejection: userInterest?.rejectionReason,
      groupId: asset?.tempGroupIds?.[0] || null,
      groupName: group?.title ?? null,
      secondaryClubId: userInterest?.secondaryClubId ?? null,
      hasVoted: !!myVote,
      choice: myVote?.choice ?? null,
      voteStartDate: votingClub?.startDate ?? null,
      voteEndDate: votingClub?.endDate ?? null,
      spvCreated: !!spv,
      spvId: spv?.id ?? null,
      spvStatus: spv?.status ?? null,
      isVotingDisabled,
      votingDisabledReason: isVotingDisabled
        ? 'Voting is disabled because your Supervisor is inactive.'
        : null,
    };
  }

  async saveOrUnsaveAsset(accountId: number, dto: SaveAssetDto) {
    return this.prisma.savedAsset.upsert({
      where: {
        accountId_assetId: {
          accountId,
          assetId: dto.assetId,
        },
      },
      update: {
        isFavourite: dto.isFavourite,
      },
      create: {
        accountId,
        assetId: dto.assetId,
        isFavourite: dto.isFavourite,
      },
    });
  }

  async getMySavedAssets(accountId: number, query: SearchablePaginatedDto) {
    const where: Prisma.SavedAssetWhereInput = {
      accountId,
      isFavourite: true,
    };
    const REQUIRED_META_KEYS = [
      'marketValue',
      'netOperationalIncome',
      'expectedAppreciationPercentage',
      'totalFractions',
      'state',
      'city',
    ];

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.savedAsset.findMany({
        where,
        include: {
          asset: {
            select: {
              id: true,
              accountId: true,
              assetSubType: true,
              assetTitle: true,
              assetType: true,
              createdAt: true,
              status: true,
              isVisible: true,
              isVerified: true,
              isSoldOut: true,
              currentOwnerName: true,
              ownershipModel: true,
              totalFractions: true,
              soldFractions: true,
              remainingFractions: true,
              assetAppreciation: true,
              updatedAt: true,
              price: true,
              rwaRequest: {
                select: {
                  status: true,
                  rejectionReason: true,
                  trusteeComment: true,
                  fractionalizationStatus: true,
                  trusteeId: true,
                },
              },
              meta: {
                where: {
                  metaKey: {
                    in: REQUIRED_META_KEYS,
                  },
                },
                select: {
                  metaKey: true,
                  metaType: true,
                  metaValue: true,
                },
              },
              documents: {
                take: 1,
              },
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: query.skip ?? 0,
        take: query.take ?? 10,
      }),

      this.prisma.savedAsset.count({ where }),
    ]);

    const data = await Promise.all(
      assets.map(async (asset) => {
        const price = await this.prisma.assetPrice.findUnique({
          where: { assetId: asset.id },
          select: {
            currentPricePerFraction: true,
          },
        });

        const marketValue = this.getMetaNumber(asset.asset.meta, 'marketValue');
        const netOperationalIncome = this.getMetaNumber(
          asset.asset.meta,
          'netOperationalIncome',
        );
        const expectedAppreciationPercentage = this.getMetaNumber(
          asset.asset.meta,
          'expectedAppreciationPercentage',
        );

        const financials = this.assetFinancialCalculator.calculate({
          marketValue,
          netOperationalIncome,
          expectedAppreciationPercentage,
          totalFractions: asset.asset.totalFractions,
          currentPricePerFraction: Number(price?.currentPricePerFraction) ?? 0,
        });

        return {
          ...asset,
          currentPricePerFraction: Number(price?.currentPricePerFraction) ?? 0,
          documents: asset.asset.documents.map((doc) => ({
            ...doc,
            url: doc.documentUrl
              ? this.storageService.resolveFileUrl(doc.documentUrl)
              : null,
          })),
          financials,
        };
      }),
    );

    return {
      data: data.map((row) => ({
        ...row.asset,
        financials: row.financials,
        isFavourite: true,
        savedAt: row.createdAt,
      })),
      total,
      skip: query.skip ?? 0,
      take: query.take ?? 10,
    };
  }

  async updateAssetPrice(assetId: number, price: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { price: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.price) {
      return this.prisma.assetPrice.create({
        data: {
          assetId,
          initialPricePerFraction: price,
          currentPricePerFraction: price,
        },
      });
    }

    return this.prisma.assetPrice.update({
      where: { assetId },
      data: {
        currentPricePerFraction: price,
      },
    });
  }

  async fractionalizeAsset(
    assetId: number,
    adminId: number,
    totalFractions: number,
    pricePerFraction: number,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        price: true,
        rwaRequest: true,
        secondaryClub: { select: { id: true } },
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.rwaRequest) {
      throw new Error('RWA request missing for asset');
    }

    if (!asset.secondaryClub) {
      throw new Error('Secondary club has not been created for this asset');
    }

    if (
      asset.rwaRequest.status !== RWAStatus.Approved &&
      asset.rwaRequest.status !== RWAStatus.DueDiligence
    ) {
      throw new Error('Asset is not approved for fractionalization');
    }
    if (!asset.isVerified) {
      throw new Error('Asset is not verified');
    }

    if (
      asset.rwaRequest.fractionalizationStatus ===
      AdminFractionalizationStatus.Completed
    ) {
      throw new Error('Asset already fractionalized');
    }

    if (asset.price) {
      throw new Error('Asset price already exists');
    }

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: {
          totalFractions,
          remainingFractions: totalFractions,
          soldFractions: 0,
          isSoldOut: false,
          // status: AssetStatus.Available,
          isVisible: true,
        },
      });

      const price = await tx.assetPrice.create({
        data: {
          assetId,
          initialPricePerFraction: pricePerFraction,
          currentPricePerFraction: pricePerFraction,
        },
      });

      const rwaRequest = await tx.rWARequest.update({
        where: { assetId },
        data: {
          fractionalizationStatus: AdminFractionalizationStatus.Completed,
          fractionalizedById: adminId,
          fractionalizedAt: now,
        },
      });

      // Eligible club voters (voted Yes + approved club membership) share
      // the owner's ASSET_FRACTIONIZE notification and path — mirrors
      // SpvService's eligibleAccountWhere.
      const secondaryClubId = asset.secondaryClub?.id;
      const eligibleVoters = secondaryClubId
        ? await tx.account.findMany({
            where: {
              votes: { some: { secondaryClubId, choice: VoteChoice.Yes } },
              clubMembershipRequests: {
                some: {
                  secondaryClubId,
                  status: MembershipStatus.Approved,
                },
              },
            },
            select: { id: true },
          })
        : [];

      await this.notificationService._sendNotification({
        code: NotificationCode.ASSET_FRACTIONIZE,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [
          asset.accountId!,
          ...new Set(eligibleVoters.map((v) => v.id)),
        ],
        data: {
          assetId: asset.id,
          name: asset.assetTitle,
        },
      });

      await this.activityService.createLog({
        type: ActivityType.RWA_ASSET_REVIEW,
        actorType:
          ACTOR_TYPE_MAP[ActivityActorType.ADMIN] ?? ActivityActorType.SYSTEM,
        actorId: adminId,
        entityType: ActivityEntityType.ASSET,
        entityId: asset.id,
        targetId: adminId,
        label: 'Asset fractionalized successfully',
        metadata: {
          message: 'Asset fractionalized successfully',
        },
      });

      return {
        message: 'Asset fractionalized successfully',
        asset: updatedAsset,
        price,
        rwaRequest,
      };
    });
  }

  async getAllAssetsByAdmin(options: {
    skip?: number;
    take?: number;
    search?: string;
    newlyAdded?: boolean;
    accountId?: number;
  }) {
    const { search, newlyAdded = true, accountId } = options;

    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };

    const where: Prisma.AssetWhereInput = {};

    if (accountId) {
      where.accountId = accountId;
    }

    if (search) {
      where.OR = [
        {
          assetTitle: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          currentOwnerName: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [assets, total] = await this.prisma.$transaction([
      this.prisma.asset.findMany({
        where,
        select: {
          id: true,
          assetTitle: true,
          currentOwnerName: true,
          status: true,
          steps: true,
          meta: {
            where: { metaKey: { in: ['address', 'city', 'state'] } },
            select: { metaKey: true, metaValue: true },
          },
          rwaRequest: { select: { status: true, rejectionReason: true } },
        },
        orderBy: {
          createdAt: newlyAdded ? 'desc' : 'asc',
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
      this.prisma.asset.count({ where }),
    ]);

    const data = assets.map((asset) => {
      const metaMap = new Map(asset.meta.map((m) => [m.metaKey, m.metaValue]));

      return {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
        location: {
          address: metaMap.get('address') ?? null,
          city: metaMap.get('city') ?? null,
          state: metaMap.get('state') ?? null,
        },
        assetStatus: asset.status,
        currentStep: Number(asset.steps ?? 0),
        rwaStatus: asset.rwaRequest?.status ?? null,
      };
    });

    return {
      count: total,
      skip: pagination.skip,
      take: pagination.take,
      data,
    };
  }

  // async updateAsset(
  //   assetId: number,
  //   accountId: number,
  //   accountType: AccountType | UserType,
  //   data: UpdateAssetDto,
  // ) {
  //   try {
  //     const existingAsset = await this.prisma.asset.findUnique({
  //       where: { id: assetId },
  //       include: {
  //         rwaRequest: true,
  //         price: true,
  //         meta: true,
  //       },
  //     });

  //     if (!existingAsset) {
  //       throw new Error('Asset not found');
  //     }

  //     // if (
  //     //   existingAsset.rwaRequest?.fractionalizationStatus !==
  //     //     AdminFractionalizationStatus.Pending &&
  //     //   existingAsset.isVisible === true
  //     // ) {
  //     //   throw new Error(
  //     //     'Asset cannot be updated after fractionalization process has started',
  //     //   );
  //     // }

  //     const { basicInfo, meta, documents, whyInvested, ownerDetails } = data;

  //     const result = await this.prisma.$transaction(async (tx) => {
  //       let updateTotalFraction = existingAsset.totalFractions;
  //       let remainingFractions = existingAsset.remainingFractions;
  //       if (data.price?.currentPricePerFraction) {
  //         const assestUpdatePrice = await tx.assetPrice.update({
  //           where: {
  //             assetId,
  //           },
  //           data: {
  //             currentPricePerFraction: data.price.currentPricePerFraction,
  //           },
  //         });

  //         const marketValueMeta = existingAsset.meta.find(
  //           (m) => m.metaKey === 'marketValue',
  //         );
  //         const marketValue = Number(marketValueMeta?.metaValue ?? 0);
  //         console.log('marketValue', marketValue);
  //         updateTotalFraction = Math.floor(
  //           marketValue / Number(assestUpdatePrice.currentPricePerFraction),
  //         );

  //         const soldFractions =
  //           existingAsset.soldFractions ??
  //           existingAsset.totalFractions - existingAsset.remainingFractions;
  //         if (updateTotalFraction < soldFractions) {
  //           throw new BadRequestException(
  //             'New fraction count cannot be less than sold fractions',
  //           );
  //         }
  //         remainingFractions = updateTotalFraction - soldFractions;
  //       }

  //       const updatedAsset = await tx.asset.update({
  //         where: { id: assetId },
  //         data: {
  //           ...(basicInfo?.assetType && {
  //             assetType: basicInfo.assetType,
  //           }),
  //           ...(basicInfo?.assetTitle && {
  //             assetTitle: basicInfo.assetTitle.trim(),
  //           }),
  //           ...(basicInfo?.currentOwnerName && {
  //             currentOwnerName: basicInfo.currentOwnerName.trim(),
  //           }),
  //           ...(basicInfo?.ownershipModel && {
  //             ownershipModel: basicInfo.ownershipModel,
  //           }),
  //           totalFractions: updateTotalFraction,
  //           remainingFractions: remainingFractions,
  //           status:
  //             existingAsset.status === AssetStatus.Rejected
  //               ? AssetStatus.Draft
  //               : existingAsset.status,
  //           ...(existingAsset.status === AssetStatus.Rejected && {
  //             rejectionReason: null,
  //             rejectedAt: null,
  //           }),
  //           ...(existingAsset.steps === '2' && {
  //             steps: accountType === AccountType.Broker ? '3' : '5',
  //           }),
  //           updateAsset: true,
  //         },
  //       });

  //       const REJECT_STAGE_UPDATE: Partial<
  //         Record<RWAStatus, Prisma.RWARequestUpdateInput>
  //       > = {
  //         [RWAStatus.Rejected]: {
  //           rejectionReason: null,
  //         },
  //         [RWAStatus.LegalRejected]: {
  //           statusForLegal: RWAStatus.Submitted,
  //           legalRejectionReason: null,
  //         },
  //         [RWAStatus.ValuationRejected]: {
  //           statusForValuation: RWAStatus.Submitted,
  //           valuationRejectionReason: null,
  //         },
  //         [RWAStatus.DueDiligenceRejected]: {
  //           statusForDueDiligence: RWAStatus.Submitted,
  //           dueDiligenceRejectionReason: null,
  //         },
  //       };

  //       const rwaRejectionStatus = existingAsset.rwaRequest?.status;
  //       const stageUpdate =
  //         rwaRejectionStatus && REJECT_STAGE_UPDATE[rwaRejectionStatus];

  //       if (existingAsset.rwaRequest && stageUpdate) {
  //         await tx.rWARequest.update({
  //           where: { assetId },
  //           data: {
  //             status: RWAStatus.Submitted,
  //             rejectedAt: null,
  //             ...stageUpdate,
  //           },
  //         });
  //       }

  //       await tx.sharedAsset.updateMany({
  //         where: {
  //           assetId,
  //           status: SharedAssetStatus.Rejected,
  //         },
  //         data: {
  //           status: SharedAssetStatus.Pending,
  //           rejectNote: null,
  //         },
  //       });

  //       if (meta !== undefined) {
  //         if (meta.length > 0) {
  //           await tx.assetMeta.deleteMany({ where: { assetId } });

  //           const mappedMeta = mapAssetMeta(meta) || [];
  //           await tx.assetMeta.createMany({
  //             data: mappedMeta.map((m) => ({
  //               ...m,
  //               assetId,
  //             })),
  //           });
  //         }
  //       }

  //       if (documents !== undefined) {
  //         // await tx.assetDocument.deleteMany({
  //         //   where: { assetId },
  //         // });
  //         const mappedDocs = mapAssetDocuments(documents);
  //         if (mappedDocs && mappedDocs.length) {
  //           await tx.assetDocument.createMany({
  //             data: mappedDocs.map((d) => ({
  //               ...d,
  //               assetId,
  //             })),
  //             skipDuplicates: true,
  //           });
  //         }
  //       }

  //       if (whyInvested !== undefined && whyInvested.length > 0) {
  //         await tx.propertyInterest.deleteMany({ where: { assetId } });

  //         for (const item of whyInvested) {
  //           const icon = await tx.icons.findUnique({
  //             where: { id: Number(item.icon) },
  //           });

  //           if (!icon) {
  //             throw new Error(`Icon with id ${item.icon} not found`);
  //           }

  //           await tx.propertyInterest.create({
  //             data: {
  //               assetId,
  //               iconId: icon.id,
  //               icon: icon.url,
  //               title: item.title,
  //               description: item.description,
  //             },
  //           });
  //         }
  //       }

  //       if (ownerDetails !== undefined) {
  //         await tx.assetOwner.upsert({
  //           where: { assetId },
  //           update: {
  //             name: ownerDetails.name,
  //             mobile: ownerDetails.mobile,
  //             email: ownerDetails.email,
  //           },
  //           create: {
  //             assetId,
  //             name: ownerDetails.name,
  //             mobile: ownerDetails.mobile,
  //             email: ownerDetails.email,
  //           },
  //         });
  //       }

  //       await this.activityService.createLog({
  //         type: ActivityType.ASSET_UPDATED,
  //         actorType: ACTOR_TYPE_MAP[accountType] ?? ActivityActorType.SYSTEM,
  //         actorId: accountId,
  //         entityType: ActivityEntityType.ASSET,
  //         entityId: assetId,
  //         targetId: accountId,
  //         label: 'Asset updated in RWA process',
  //         metadata: {
  //           message: 'Asset details updated',
  //         },
  //       });

  //       return updatedAsset;
  //     });

  //     try {
  //       const trustees = await this.prisma.account.findMany({
  //         where: { type: AccountType.Trustee },
  //         select: { id: true },
  //       });
  //       const trusteeIds = trustees.map((t) => t.id);

  //       await this.notificationService._sendNotification({
  //         code: AdminNotificationCode.RWA_FILLED_FULL_DETAILS,
  //         audience: trusteeIds.length
  //           ? NotificationAudience.BOTH
  //           : NotificationAudience.ADMIN,
  //         userIds: trusteeIds,
  //         type: NotificationType.Informational,
  //         createdById: accountId,
  //         data: {
  //           assetId: result.id,
  //           assetTitle: result.assetTitle,
  //           rwaRequestId: existingAsset.rwaRequest?.id,
  //         },
  //       });
  //     } catch (notificationError) {
  //       console.error('Notification failed', notificationError);
  //     }

  //     return result;
  //   } catch (error) {
  //     console.error('Update asset failed', {
  //       assetId,
  //       accountId,
  //       error,
  //     });

  //     throw error;
  //   }
  // }

  // new code for update Asset

  async updateAsset(
    assetId: number,
    accountId: number,
    accountType: AccountType | UserType,
    data: UpdateAssetDto,
  ) {
    try {
      const existingAsset = await this.prisma.asset.findUnique({
        where: { id: assetId },
        include: {
          rwaRequest: true,
          meta: { where: { metaKey: 'marketValue' } },
        },
      });

      if (!existingAsset) {
        throw new Error('Asset not found');
      }

      // if (
      //   existingAsset.rwaRequest?.fractionalizationStatus !==
      //     AdminFractionalizationStatus.Pending &&
      //   existingAsset.isVisible === true
      // ) {
      //   throw new Error(
      //     'Asset cannot be updated after fractionalization process has started',
      //   );
      // }

      const { basicInfo, meta, documents, whyInvested, ownerDetails } = data;

      const requestedStageFields = ALL_RWA_STAGE_FIELDS.filter(
        (field) => data[field] !== undefined,
      );

      const result = await this.prisma.$transaction(async (tx) => {
        let updateTotalFraction = existingAsset.totalFractions;
        let remainingFractions = existingAsset.remainingFractions;
        if (data.price?.currentPricePerFraction) {
          const assestUpdatePrice = await tx.assetPrice.update({
            where: {
              assetId,
            },
            data: {
              currentPricePerFraction: data.price.currentPricePerFraction,
            },
          });

          const marketValueMeta = existingAsset.meta.find(
            (m) => m.metaKey === 'marketValue',
          );
          const marketValue = Number(marketValueMeta?.metaValue ?? 0);
          updateTotalFraction = Math.floor(
            marketValue / Number(assestUpdatePrice.currentPricePerFraction),
          );

          const soldFractions =
            existingAsset.soldFractions ??
            existingAsset.totalFractions - existingAsset.remainingFractions;
          if (updateTotalFraction < soldFractions) {
            throw new BadRequestException(
              'New fraction count cannot be less than sold fractions',
            );
          }
          remainingFractions = updateTotalFraction - soldFractions;
        }

        const updatedAsset = await tx.asset.update({
          where: { id: assetId },
          data: {
            ...(basicInfo?.assetType && {
              assetType: basicInfo.assetType,
            }),
            ...(basicInfo?.assetTitle && {
              assetTitle: basicInfo.assetTitle.trim(),
            }),
            ...(basicInfo?.currentOwnerName && {
              currentOwnerName: basicInfo.currentOwnerName.trim(),
            }),
            ...(basicInfo?.ownershipModel && {
              ownershipModel: basicInfo.ownershipModel,
            }),
            totalFractions: updateTotalFraction,
            remainingFractions: remainingFractions,
            status:
              existingAsset.status === AssetStatus.Rejected
                ? AssetStatus.Draft
                : existingAsset.status,
            ...(existingAsset.status === AssetStatus.Rejected && {
              rejectionReason: null,
              rejectedAt: null,
            }),
            ...(existingAsset.steps === '2' && {
              steps: accountType === AccountType.Broker ? '3' : '5',
            }),
            updateAsset: true,
          },
        });

        // --- Stage-specific resubmission logic ---
        if (existingAsset.rwaRequest) {
          const rwaRequest = existingAsset.rwaRequest;

          if (requestedStageFields.length) {
            const updateData: Prisma.RWARequestUpdateInput = {};

            for (const field of requestedStageFields) {
              const stageConfig = STAGE_FIELD_CONFIG[field];
              const currentStageStatus = rwaRequest[field];

              if (currentStageStatus !== stageConfig.rejectedStatus) {
                throw new BadRequestException(
                  `Cannot resubmit ${field}: current status is ${currentStageStatus}, expected ${stageConfig.rejectedStatus}`,
                );
              }

              updateData[field] = RWAStatus.Submitted;
              updateData[stageConfig.rejectionReasonField] = null;
            }

            const allStageFields = [
              'statusForLegal',
              'statusForValuation',
              'statusForDueDiligence',
            ] as const;
            const otherStagesStillRejected = allStageFields
              .filter((field) => !requestedStageFields.includes(field))
              .some((field) => {
                const value = rwaRequest[field];
                return (
                  value === RWAStatus.LegalRejected ||
                  value === RWAStatus.ValuationRejected ||
                  value === RWAStatus.DueDiligenceRejected
                );
              });

            if (!otherStagesStillRejected) {
              updateData.status = RWAStatus.Submitted;
              updateData.rejectedAt = null;
            }

            await tx.rWARequest.update({
              where: { assetId },
              data: updateData,
            });
          } else {
            const rwaRejectionStatus = existingAsset.rwaRequest.status;
            const stageUpdate =
              rwaRejectionStatus && REJECT_STAGE_UPDATE[rwaRejectionStatus];

            if (stageUpdate) {
              await tx.rWARequest.update({
                where: { assetId },
                data: {
                  status: RWAStatus.Submitted,
                  rejectedAt: null,
                  ...stageUpdate,
                },
              });
            }
          }
        }

        await tx.sharedAsset.updateMany({
          where: {
            assetId,
            status: SharedAssetStatus.Rejected,
          },
          data: {
            status: SharedAssetStatus.Pending,
            rejectNote: null,
          },
        });

        if (meta !== undefined) {
          if (meta.length > 0) {
            await tx.assetMeta.deleteMany({ where: { assetId } });

            const mappedMeta = mapAssetMeta(meta) || [];
            await tx.assetMeta.createMany({
              data: mappedMeta.map((m) => ({
                ...m,
                assetId,
              })),
            });
          }
        }

        if (documents !== undefined) {
          // await tx.assetDocument.deleteMany({
          //   where: { assetId },
          // });
          const mappedDocs = mapAssetDocuments(documents);
          if (mappedDocs && mappedDocs.length) {
            await tx.assetDocument.createMany({
              data: mappedDocs.map((d) => ({
                ...d,
                assetId,
              })),
              skipDuplicates: true,
            });
          }
        }

        if (whyInvested !== undefined && whyInvested.length > 0) {
          await tx.propertyInterest.deleteMany({ where: { assetId } });

          const iconIds = [
            ...new Set(whyInvested.map((item) => Number(item.icon))),
          ];
          const icons = await tx.icons.findMany({
            where: { id: { in: iconIds } },
          });
          const iconById = new Map(icons.map((icon) => [icon.id, icon]));

          const propertyInterests = whyInvested.map((item) => {
            const icon = iconById.get(Number(item.icon));
            if (!icon) {
              throw new Error(`Icon with id ${item.icon} not found`);
            }

            return {
              assetId,
              iconId: icon.id,
              icon: icon.url,
              title: item.title,
              description: item.description,
            };
          });

          await tx.propertyInterest.createMany({ data: propertyInterests });
        }

        if (ownerDetails !== undefined) {
          await tx.assetOwner.upsert({
            where: { assetId },
            update: {
              name: ownerDetails.name,
              mobile: ownerDetails.mobile,
              email: ownerDetails.email,
            },
            create: {
              assetId,
              name: ownerDetails.name,
              mobile: ownerDetails.mobile,
              email: ownerDetails.email,
            },
          });
        }

        await this.activityService.createLog({
          type: ActivityType.ASSET_UPDATED,
          actorType: ACTOR_TYPE_MAP[accountType] ?? ActivityActorType.SYSTEM,
          actorId: accountId,
          entityType: ActivityEntityType.ASSET,
          entityId: assetId,
          targetId: accountId,
          label: 'Asset updated in RWA process',
          metadata: {
            message: 'Asset details updated',
          },
        });

        return updatedAsset;
      });

      try {
        const trustees = await this.prisma.account.findMany({
          where: { type: AccountType.Trustee },
          select: { id: true },
        });
        const trusteeIds = trustees.map((t) => t.id);

        await this.notificationService._sendNotification({
          code: AdminNotificationCode.RWA_FILLED_FULL_DETAILS,
          audience: trusteeIds.length
            ? NotificationAudience.BOTH
            : NotificationAudience.ADMIN,
          userIds: trusteeIds,
          type: NotificationType.Informational,
          createdById: accountId,
          data: {
            assetId: result.id,
            assetTitle: result.assetTitle,
            rwaRequestId: existingAsset.rwaRequest?.id,
          },
        });
      } catch (notificationError) {
        console.error('Notification failed', notificationError);
      }

      return result;
    } catch (error) {
      console.error('Update asset failed', {
        assetId,
        accountId,
        error,
      });

      throw error;
    }
  }

  async switchToMarketPlace(assetId: number) {
    const asset = await this.prisma.asset.findFirst({
      where: {
        id: assetId,
        isSoldOut: true,
      },
      select: {
        id: true,
        isMarketplace: true,
        assetTitle: true,
      },
    });

    if (!asset) {
      throw new Error('Asset is not sold out or asset not found');
    }

    const updatedAsset = await this.prisma.asset.update({
      where: {
        id: assetId,
      },
      data: {
        isMarketplace: !asset.isMarketplace,
      },
    });

    if (updatedAsset.isMarketplace === true) {
      const users = await this.prisma.account.findMany({
        select: { id: true },
      });

      const userIds = users.map((user) => user.id);
      await this.notificationService._sendNotification({
        code: NotificationCode.ASSET_IN_MARKETPLACE_LISTED,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: userIds,
        data: {
          assetId: updatedAsset.id,
          asset: asset.assetTitle,
        },
      });
    }

    return {
      message: updatedAsset.isMarketplace
        ? 'Marketplace enabled successfully'
        : 'Marketplace disabled successfully',

      data: updatedAsset,
    };
  }

  async assetReviewByAdmin(
    assetId: number,
    adminId: number,
    data: {
      status: AssetStatus;
      rejectionReason?: string;
    },
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (data.status === AssetStatus.Rejected && !data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    if (
      asset.status === AssetStatus.Reviewed ||
      asset.status === AssetStatus.Rejected
    ) {
      throw new Error(`Asset already ${asset.status.toLowerCase()}`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updated = await tx.asset.update({
        where: { id: assetId },
        data: {
          status:
            data.status === AssetStatus.Reviewed
              ? AssetStatus.Reviewed
              : AssetStatus.Rejected,

          rejectionReason: data.rejectionReason,
          approvedAt: data.status === AssetStatus.Reviewed ? now : null,
          rejectedAt: data.status === AssetStatus.Rejected ? now : null,
          ...(data.status === AssetStatus.Reviewed && {
            steps: '2',
          }),
        },
      });

      await this.activityService.createLog({
        type: ActivityType.RWA_ASSET_REVIEW,
        actorType:
          ACTOR_TYPE_MAP[ActivityActorType.ADMIN] ?? ActivityActorType.SYSTEM,
        actorId: adminId,
        entityType: ActivityEntityType.ASSET,
        entityId: asset.id,
        targetId: asset.accountId!,
        label:
          data.status === AssetStatus.Reviewed
            ? 'RWA asset approved'
            : 'RWA asset review rejected',
      });

      return updated;
    });

    if (data.status === AssetStatus.Reviewed) {
      await this.notificationService._sendNotification({
        code: NotificationCode.RWA_ASSET_REVIEWED_BY_ADMIN,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [asset.accountId!],
        data: {
          assetId: asset.id,
          name: asset.assetTitle,
        },
      });
    } else {
      await this.notificationService._sendNotification({
        code: NotificationCode.RWA_ASSET_REJECTED_BY_ADMIN,
        audience: NotificationAudience.USER,
        type: NotificationType.Informational,
        userIds: [asset.accountId!],
        data: {
          assetId: asset.id,
          name: asset.assetTitle,
        },
      });
    }
    return result;
  }

  async requestListing(assetId: number, accountId: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.steps !== '6') {
      throw new Error('Asset is not ready to request listing');
    }

    if (asset.status === AssetStatus.Available) {
      throw new Error('Asset is already live');
    }

    if (asset.status === AssetStatus.RequestLive) {
      throw new Error('Listing has already been requested');
    }

    const updatedAsset = await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        status: AssetStatus.RequestLive,
      },
    });

    await this.activityService.createLog({
      type: ActivityType.ASSET_UPDATED,
      actorType: ACTOR_TYPE_MAP[UserType.User] ?? ActivityActorType.SYSTEM,
      actorId: accountId,
      entityType: ActivityEntityType.ASSET,
      entityId: asset.id,
      targetId: accountId,
      label: 'Asset listing requested',
    });

    await this.notificationService._sendNotification({
      code: AdminNotificationCode.REQUEST_LIVE,
      audience: NotificationAudience.ADMIN,
      type: NotificationType.Informational,
      data: {
        groupId: asset.tempGroupIds[0],
        assetTitle: asset.assetTitle,
      },
    });

    return updatedAsset;
  }

  async finalizeListing(
    assetId: number,
    adminId: number,
    data: {
      name: string;
      totalFractions: number;
      pricePerFraction: number;
      secondaryClubId: number;
      status: AssetStatus;
      listingAmount?: number;
      rejectionReason?: string;
    },
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: { rwaRequest: true, price: true },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.rwaRequest) {
      throw new Error('RWA request not found for asset');
    }

    if (asset.steps !== '6') {
      throw new Error('Asset is not ready for final listing approval');
    }

    if (asset.status === AssetStatus.Available) {
      throw new Error('Asset is already live');
    }

    if (asset.status !== AssetStatus.RequestLive) {
      throw new Error('Asset owner has not requested listing yet');
    }

    if (data.status === AssetStatus.Available && !data.listingAmount) {
      throw new Error('Listing amount is required when approving');
    }

    if (data.status === AssetStatus.Rejected && !data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    if (
      asset.rwaRequest.fractionalizationStatus ===
      AdminFractionalizationStatus.Completed
    ) {
      throw new Error('Asset already fractionalized');
    }

    if (asset.price) {
      throw new Error('Asset price already exists');
    }

    const isApproved = data.status === AssetStatus.Available;

    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      const updatedAsset = await tx.asset.update({
        where: { id: assetId },
        data: isApproved
          ? {
              status: AssetStatus.Available,
              isVisible: true,
              rejectionReason: null,
              rejectedAt: null,
              totalFractions: data.totalFractions,
              remainingFractions: data.totalFractions,
              soldFractions: 0,
              isSoldOut: false,
            }
          : {
              rejectionReason: data.rejectionReason,
              rejectedAt: now,
            },
      });

      await tx.assetPrice.create({
        data: {
          assetId,
          initialPricePerFraction: data.pricePerFraction,
          currentPricePerFraction: data.pricePerFraction,
        },
      });

      await tx.rWARequest.update({
        where: { assetId },
        data: {
          fractionalizationStatus: AdminFractionalizationStatus.Completed,
          fractionalizedById: adminId,
          fractionalizedAt: now,
        },
      });

      const sharedAssetFields = isApproved
        ? {
            approvedBy: adminId,
            approvedAt: now,
            status: SharedAssetStatus.Approved,
            tokenAmount: data.listingAmount,
            rejectNote: null,
          }
        : {
            status: SharedAssetStatus.Rejected,
            rejectNote: data.rejectionReason,
            tokenAmount: null,
          };

      await tx.sharedAsset.upsert({
        where: { assetId },
        create: {
          assetId,
          sharedById: asset.accountId!,
          ...sharedAssetFields,
        },
        update: sharedAssetFields,
      });

      const existingSpv = await tx.spv.findFirst({
        where: { secondaryClubId: data.secondaryClubId },
      });
      if (existingSpv) {
        throw new BadRequestException(
          'An SPV already exists for this secondary club',
        );
      }

      await tx.spv.create({
        data: {
          name: data.name,
          secondaryClubId: data.secondaryClubId,
          createdById: adminId,
        },
      });

      await this.activityService.createLog({
        type: ActivityType.RWA_ASSET_REVIEW,
        actorType:
          ACTOR_TYPE_MAP[ActivityActorType.ADMIN] ?? ActivityActorType.SYSTEM,
        actorId: adminId,
        entityType: ActivityEntityType.ASSET,
        entityId: asset.id,
        targetId: asset.accountId!,
        label: isApproved ? 'Asset listing approved' : 'Asset listing rejected',
      });

      return updatedAsset;
    });

    await this.notificationService._sendNotification({
      code: isApproved
        ? NotificationCode.ADMIN_APPROVED_LIVE_REQUEST
        : NotificationCode.ADMIN_REJECTED_LIVE_REQUEST,
      audience: NotificationAudience.USER,
      type: NotificationType.Informational,
      userIds: [asset.accountId!],
      data: {
        assetId: asset.id,
        assetTitle: asset.assetTitle,
      },
    });

    return result;
  }
}
