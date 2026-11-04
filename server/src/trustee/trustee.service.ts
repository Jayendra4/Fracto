import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import { AccountsService } from '../accounts';
import {
  AccountType,
  NotificationType,
  Prisma,
  RWAStatus,
} from '../generated/prisma/client';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityService,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity';
import { NotificationService } from '../notification';
import { NotificationAudience, NotificationCode } from '@Common';

export type CheckpointStatus = 'Pending' | 'Approved' | 'Rejected';

export interface VerifierCheckpoint {
  checkpoint: string;
  verifiedBy: string | null;
  date: Date | null;
  status: CheckpointStatus;
}

// The RWARequest row only ever holds the trustee/timestamp of its *current*
// stage — every transition overwrites the shared trusteeId/approvedAt/
// rejectedAt columns (see `assetReview` below), so there is no per-checkpoint
// history to read back. Each checkpoint's Approved/Rejected state is instead
// derived from where the current RWAStatus falls in the Legal -> Valuation ->
// Due Diligence sequence, and — per product decision — every checkpoint that
// has been reached shares the single trustee/date the row actually stores
// (real data, not fabricated per-stage timestamps).
const VERIFIER_CHECKPOINTS: Array<{
  checkpoint: string;
  rank: number;
  rejectedStatus: RWAStatus;
}> = [
  {
    checkpoint: 'Legal Review',
    rank: 1,
    rejectedStatus: RWAStatus.LegalRejected,
  },
  {
    checkpoint: 'Valuation Review',
    rank: 2,
    rejectedStatus: RWAStatus.ValuationRejected,
  },
  {
    checkpoint: 'Due Diligence',
    rank: 3,
    rejectedStatus: RWAStatus.DueDiligenceRejected,
  },
];

@Injectable()
export class TrusteeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly AccountsService: AccountsService,
    private readonly activityService: ActivityService,
    private readonly notificationService: NotificationService,
  ) {}

  async createTrustee(dto: CreateTrusteeDto) {
    const existing = await this.prisma.account.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new Error('Email already registered');
    }
    const account = await this.prisma.account.create({
      data: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        email: dto.email,
        mobile: dto.mobile,
        dialCode: dto.dialCode,
        profileImage: dto.profileImage,
        type: AccountType.Trustee,
      },
    });

    const metaData: any = {};

    if (dto.panNumber) metaData.panNumber = dto.panNumber;
    if (dto.passportNumber) metaData.passportNumber = dto.passportNumber;
    if (dto.emiratiId) metaData.emiratiId = dto.emiratiId;
    if (dto.occupation) metaData.occupation = dto.occupation;
    if (dto.monthlyIncome) metaData.monthlyIncome = dto.monthlyIncome;
    if (dto.dateOfBirth) metaData.dateOfBirth = new Date(dto.dateOfBirth);

    if (Object.keys(metaData).length > 0) {
      await this.prisma.accountMeta.create({
        data: {
          accountId: account.id,
          ...metaData,
        },
      });
    }

    return {
      message: 'Trustee created successfully',
      accountId: account.id,
    };
  }

  async assetReview(
    assetId: number,
    trusteeId: number,
    data: {
      status: RWAStatus;
      rejectionReason?: string;
      trusteeComment?: string;
    },
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: {
        id: assetId,
        updateAsset: true,
        rwaRequest: {
          isNot: {
            status: RWAStatus.Draft,
          },
        },
      },
      include: {
        rwaRequest: true,
        account: {
          select: {
            id: true,
            companyKyc: { select: { overallStatus: true } },
            kyc: {
              select: {
                status: true,
              },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new Error('Comission percentage is not approved by Asset Owner');
    }

    if (!asset.rwaRequest) {
      throw new Error('RWA request not found for asset');
    }

    if (
      (!asset.account?.kyc || asset.account.kyc.status !== 'Approved') &&
      (!asset.account?.companyKyc ||
        asset.account.companyKyc.overallStatus !== 'Approved')
    ) {
      throw new Error('Asset owner KYC/KYB is not approved');
    }

    const trustee = await this.prisma.account.findUnique({
      where: { id: trusteeId },
      select: { isVerified: true },
    });

    if (!trustee?.isVerified) {
      throw new Error('Trustee KYC not approved');
    }

    const REJECT_STATUSES = new Set<RWAStatus>([
      RWAStatus.Rejected,
      RWAStatus.LegalRejected,
      RWAStatus.ValuationRejected,
      RWAStatus.DueDiligenceRejected,
    ]);

    if (REJECT_STATUSES.has(data.status) && !data.rejectionReason) {
      throw new Error('Rejection reason is required');
    }

    if (
      asset.rwaRequest.status === RWAStatus.Approved ||
      asset.rwaRequest.status === RWAStatus.Rejected
    ) {
      throw new Error(`Asset already ${asset.rwaRequest.status.toLowerCase()}`);
    }
    type StageKey = 'legal' | 'valuation' | 'dueDiligence';

    const STAGE_KEY: Partial<Record<RWAStatus, StageKey>> = {
      [RWAStatus.LegalReviewed]: 'legal',
      [RWAStatus.LegalRejected]: 'legal',
      [RWAStatus.ValuationReviewed]: 'valuation',
      [RWAStatus.ValuationRejected]: 'valuation',
      [RWAStatus.DueDiligence]: 'dueDiligence',
      [RWAStatus.DueDiligenceRejected]: 'dueDiligence',
    };
    const stageStatusMap: Record<StageKey, RWAStatus | null> = {
      legal: asset.rwaRequest.statusForLegal,
      valuation: asset.rwaRequest.statusForValuation,
      dueDiligence: asset.rwaRequest.statusForDueDiligence,
    };

    const incomingStageKey: StageKey | undefined = STAGE_KEY[data.status];

    // RWARequest.statusForLegal/statusForValuation/statusForDueDiligence are
    // seeded with a placeholder (Draft/Submitted/Approved) at creation time,
    // never null — so a plain truthiness check here would flag every stage
    // as "already reviewed" from the very first submission. Only a stage
    // whose stored status is itself one of that stage's terminal outcomes
    // (Reviewed/Rejected) has actually been reviewed before.
    const currentStageStatus = incomingStageKey
      ? stageStatusMap[incomingStageKey]
      : null;
    if (
      incomingStageKey &&
      currentStageStatus &&
      STAGE_KEY[currentStageStatus] === incomingStageKey
    ) {
      throw new Error(`Asset already reviewed for ${incomingStageKey}`);
    }
    const result = await this.prisma.$transaction(async (tx) => {
      const now = new Date();

      const isApproved = data.status === RWAStatus.Approved;

      const isRejected = REJECT_STATUSES.has(data.status);

      const isDueDiligenceApproved =
        data.status === RWAStatus.DueDiligence && !isRejected;

      const stageUpdate: Prisma.RWARequestUpdateInput = {};

      switch (data.status) {
        case RWAStatus.LegalReviewed:
          stageUpdate.statusForLegal = data.status;
          break;
        case RWAStatus.LegalRejected:
          stageUpdate.statusForLegal = data.status;
          stageUpdate.legalRejectionReason = data.rejectionReason;
          break;

        case RWAStatus.ValuationReviewed:
          stageUpdate.statusForValuation = data.status;
          break;
        case RWAStatus.ValuationRejected:
          stageUpdate.statusForValuation = data.status;
          stageUpdate.valuationRejectionReason = data.rejectionReason;
          break;

        case RWAStatus.DueDiligence:
          stageUpdate.statusForDueDiligence = data.status;
          break;
        case RWAStatus.DueDiligenceRejected:
          stageUpdate.statusForDueDiligence = data.status;
          stageUpdate.dueDiligenceRejectionReason = data.rejectionReason;
          break;
      }

      const updateRwa = await tx.rWARequest.update({
        where: {
          assetId,
        },
        data: {
          status: data.status,
          trusteeId: trusteeId,
          trusteeComment: data.trusteeComment,
          ...(data.status === RWAStatus.Rejected && {
            rejectionReason: data.rejectionReason,
          }),
          approvedAt: isApproved || isDueDiligenceApproved ? now : null,
          rejectedAt: isRejected ? now : null,
          ...stageUpdate,
        },
      });

      // The asset is only fully verified once all three trustee stages have
      // each reached their own successful terminal status — reviewing due
      // diligence alone (or any single stage) must not verify the asset
      // ahead of the other stages.
      const isFullyApproved =
        updateRwa.statusForLegal === RWAStatus.LegalReviewed &&
        updateRwa.statusForValuation === RWAStatus.ValuationReviewed &&
        updateRwa.statusForDueDiligence === RWAStatus.DueDiligence;

      await tx.asset.update({
        where: {
          id: updateRwa.assetId,
        },
        data: {
          isVerified: isApproved || isFullyApproved,
          ...((isApproved || isFullyApproved) && { steps: '6' }),
        },
      });

      await this.activityService.createLog({
        type: ActivityType.RWA_ASSET_REVIEW,
        actorType:
          ACTOR_TYPE_MAP[ActivityActorType.TRUSTEE] ?? ActivityActorType.SYSTEM,
        actorId: trusteeId,
        entityType: ActivityEntityType.ASSET,
        entityId: asset.id,
        targetId: asset.accountId!,
        label: isApproved
          ? 'RWA asset approved'
          : isDueDiligenceApproved
            ? 'RWA asset reviewed'
            : isRejected
              ? 'RWA asset review rejected'
              : 'RWA asset review updated',
      });

      return {
        updateRwa,
        isApproved: isApproved || isFullyApproved,
        isRejected,
      };
    });

    if (result.isApproved) {
      await this.notificationService._sendNotification({
        code: NotificationCode.RWA_ASSET_REVIEWED_BY_TRUSTEE,
        audience: NotificationAudience.BOTH,
        type: NotificationType.Informational,
        userIds: [asset.accountId!],
        data: {
          assetId: asset.id,
          name: asset.assetTitle,
        },
      });
    } else if (result.isRejected) {
      await this.notificationService._sendNotification({
        code: NotificationCode.RWA_ASSET_REJECTED_BY_TRUSTEE,
        audience: NotificationAudience.BOTH,
        type: NotificationType.Informational,
        userIds: [asset.accountId!],
        data: {
          assetId: asset.id,
          name: asset.assetTitle,
        },
      });
    }
    return result.updateRwa;
  }

  // Ranks an RWAStatus by how many of the 3 sequential checkpoints it implies
  // have been passed. Rejections roll back to the last-passed stage (see the
  // resubmission mapping in AssetService), so a *Rejected variant still
  // ranks at the number of stages passed before it, not one less.
  private rwaStatusRank(status: RWAStatus): number {
    switch (status) {
      case RWAStatus.LegalReviewed:
      case RWAStatus.ValuationRejected:
        return 1;
      case RWAStatus.ValuationReviewed:
      case RWAStatus.DueDiligenceRejected:
        return 2;
      case RWAStatus.DueDiligence:
      case RWAStatus.Approved:
        return 3;
      default:
        return 0;
    }
  }

  private buildVerifierCheckpoints(
    rwaRequest: {
      status: RWAStatus;
      trusteeId: number | null;
      approvedAt: Date | null;
      rejectedAt: Date | null;
    } | null,
    trusteeNamesById: Map<number, string>,
  ): VerifierCheckpoint[] {
    if (!rwaRequest) {
      return VERIFIER_CHECKPOINTS.map((def) => ({
        checkpoint: def.checkpoint,
        verifiedBy: null,
        date: null,
        status: 'Pending',
      }));
    }

    const rank = this.rwaStatusRank(rwaRequest.status);
    // approvedAt/rejectedAt are only ever populated on the RWA request's
    // final transition (see `assetReview`) — intermediate stage transitions
    // null both out. So a checkpoint reached mid-flow (e.g. Legal Review
    // while Valuation is still pending) is Approved but genuinely has no
    // stored date yet; only once the flow reaches its last stage does a real
    // date exist, which then applies to every checkpoint reached so far.
    const date = rwaRequest.approvedAt ?? rwaRequest.rejectedAt ?? null;
    const verifiedBy =
      date && rwaRequest.trusteeId
        ? (trusteeNamesById.get(rwaRequest.trusteeId) ?? null)
        : null;

    return VERIFIER_CHECKPOINTS.map((def) => {
      if (rwaRequest.status === def.rejectedStatus) {
        return {
          checkpoint: def.checkpoint,
          verifiedBy,
          date,
          status: 'Rejected',
        };
      }
      if (rank >= def.rank) {
        return {
          checkpoint: def.checkpoint,
          verifiedBy,
          date,
          status: 'Approved',
        };
      }
      return {
        checkpoint: def.checkpoint,
        verifiedBy: null,
        date: null,
        status: 'Pending',
      };
    });
  }

  // Admin/Trustee-facing tracker: every asset that has an SPV, grouped under
  // that SPV, with its RWA status and the derived Legal/Valuation/Due
  // Diligence checkpoint breakdown.
  async getVerifierTracker(options?: {
    search?: string;
    rwaStatus?: RWAStatus;
    skip?: number;
    take?: number;
  }) {
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const search = options?.search?.trim();

    const where: Prisma.SpvWhereInput = {
      secondaryClub: {
        assetId: { not: null },
        ...(options?.rwaStatus && {
          asset: { rwaRequest: { status: options.rwaStatus } },
        }),
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          {
            secondaryClub: {
              asset: { assetTitle: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      }),
    };

    const [count, spvs] = await Promise.all([
      this.prisma.spv.count({ where }),
      this.prisma.spv.findMany({
        where,
        select: {
          id: true,
          name: true,
          secondaryClub: {
            select: {
              asset: {
                select: {
                  id: true,
                  assetTitle: true,
                  rwaRequest: {
                    select: {
                      status: true,
                      trusteeId: true,
                      approvedAt: true,
                      rejectedAt: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    if (spvs.length === 0) {
      return { count, skip: pagination.skip, take: pagination.take, data: [] };
    }

    const trusteeIds = [
      ...new Set(
        spvs
          .map((spv) => spv.secondaryClub.asset?.rwaRequest?.trusteeId)
          .filter((id): id is number => id != null),
      ),
    ];

    const trustees = trusteeIds.length
      ? await this.prisma.account.findMany({
          where: { id: { in: trusteeIds } },
          select: { id: true, firstname: true, lastname: true },
        })
      : [];
    const trusteeNamesById = new Map(
      trustees.map((trustee) => [
        trustee.id,
        `${trustee.firstname} ${trustee.lastname}`.trim(),
      ]),
    );

    const data = spvs
      .filter((spv) => spv.secondaryClub.asset)
      .map((spv) => {
        const asset = spv.secondaryClub.asset!;

        return {
          spvId: spv.id,
          spvName: spv.name,
          assetId: asset.id,
          assetTitle: asset.assetTitle,
          rwaStatus: asset.rwaRequest?.status ?? null,
          checkpoints: this.buildVerifierCheckpoints(
            asset.rwaRequest,
            trusteeNamesById,
          ),
        };
      });

    return { count, skip: pagination.skip, take: pagination.take, data };
  }
}
