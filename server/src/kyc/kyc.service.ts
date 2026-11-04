import {
  AuthenticatedUser,
  NotificationAudience,
  NotificationCode,
  StorageService,
  UserType,
  UtilsService,
} from '@Common';
import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import {
  AccountType,
  KycStatus,
  KycVerifier,
  NotificationType,
} from '../generated/prisma/enums';
import { PrismaService } from '../prisma';
import { VerifyCompanyKycDto } from './dto';
import { ActivityService } from '../activity';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity/activity.types';
import { NotificationService } from '../notification';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly utilsService: UtilsService,
    private readonly activityService: ActivityService,
    private readonly storageServicee: StorageService,
    private readonly notificationService: NotificationService,
  ) {}

  private resolveKycVerifier(type: AccountType | UserType): KycVerifier {
    if (type === UserType.User) {
      throw new Error(
        'UserType is not allowed for KYC verification resolution',
      );
    }
    return type === AccountType.Trustee
      ? KycVerifier.Trustee
      : KycVerifier.Admin;
  }

  async getKycList(
    accountId: number,
    type: AccountType | UserType,
    options: {
      search?: string;
      status?: KycStatus;
      userType?: AccountType;
      skip?: number;
      take?: number;
    },
  ) {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.KycWhereInput = {
      verifier: 'Admin',
    };

    if (options.status) {
      where.status = options.status;
    }

    if (options.userType) {
      where.account = {
        type: options.userType,
      };
    } else {
      where.account = {
        ...(options.userType
          ? { type: options.userType }
          : {
              OR: [
                { type: AccountType.AssetOwner },
                { type: AccountType.Broker },
                { type: AccountType.CorporateInvestor },
              ],
            }),
      };
    }

    if (search) {
      const buildSearchFilter = (search: string): Prisma.KycWhereInput[] => [
        {
          rejectionReason: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
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

    const totalKycs = await this.prisma.kyc.count({
      where,
    });

    const kycs = await this.prisma.kyc.findMany({
      where,
      orderBy: { updatedAt: Prisma.SortOrder.desc },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        verifier: true,
        reviewedAt: true,
        account: {
          include: {
            meta: {
              select: {
                passportNumber: true,
                emiratiId: true,
                occupation: true,
                monthlyIncome: true,
                dateOfBirth: true,
                accountId: true,
              },
            },
          },
        },
      },
      skip: pagination.skip,
      take: pagination.take,
    });

    const response = await this.utilsService.batchable(kycs, async (user) => {
      return {
        ...user,
        profileImage: user.account.profileImage
          ? this.storageServicee.resolveFileUrl(user.account.profileImage)
          : null,
      };
    });

    return {
      count: totalKycs,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async getKycById(
    accountId: number,
    type: AccountType | UserType,
    kycId: number,
  ) {
    const verifier = this.resolveKycVerifier(type);

    const kyc = await this.prisma.kyc.findFirst({
      where: {
        id: kycId,
        verifier,
      },
      include: {
        account: {
          include: {
            permanentAddress: true,
            currentAddress: true,
            meta: {
              select: {
                passportNumber: true,
                emiratiId: true,
                occupation: true,
                monthlyIncome: true,
                dateOfBirth: true,
                accountId: true,
              },
            },
            entityDocument: true,
          },
        },
      },
    });

    if (!kyc) {
      throw new Error('KYC not found');
    }

    return {
      ...kyc,
      account: {
        ...kyc.account,
        entityDocument:
          kyc.account?.entityDocument?.map((doc) => ({
            ...doc,
            url: this.storageServicee.resolveFileUrl(doc.url),
          })) ?? [],
      },
    };
  }

  async verifyKyc(
    kycId: number,
    user: AuthenticatedUser,
    data: {
      action: KycStatus;
      rejectionReason?: string;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const kyc = await tx.kyc.findUnique({
        where: { id: kycId },
      });

      if (!kyc) {
        throw new Error('KYC not found');
      }
      const findUser = await this.prisma.account.findUnique({
        where: {
          id: kyc.accountId,
        },
        select: {
          id: true,
        },
      });

      if (kyc.status !== 'Submitted' && kyc.status !== 'Rejected') {
        throw new Error(`KYC cannot be verified in ${kyc.status} state`);
      }

      if (data.action === KycStatus.Approved) {
        await tx.kyc.update({
          where: { id: kycId },
          data: {
            status: KycStatus.Approved,
            reviewedAt: new Date(),
            reviewedById: user.id,
            rejectionReason: data.rejectionReason,
          },
        });

        await tx.account.update({
          where: { id: kyc.accountId },
          data: { isVerified: true },
        });

        await tx.entityDocument.updateMany({
          where: {
            accountId: kyc.accountId,
            isVerified: false,
          },
          data: {
            isVerified: true,
            verifiedAt: new Date(),
          },
        });
        await this.notificationService._sendNotification({
          code: NotificationCode.KYC_APPROVED,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: [findUser!.id],
        });

        await this.activityService.createLog(
          {
            type: ActivityType.KYC_APPROVED,
            actorType: ACTOR_TYPE_MAP[user.type] ?? ActivityActorType.SYSTEM,
            actorId: user.id, // who perform the action
            entityType: ActivityEntityType.KYC,
            entityId: kycId,
            targetId: kyc.accountId,
            label: 'KYC approved',
            metadata: {
              message: 'Approved KYC details',
            },
          },
          { tx },
        );

        return { message: 'KYC approved successfully' };
      }

      if (data.action === KycStatus.Rejected) {
        if (!data.rejectionReason) {
          throw new Error('Rejection reason is required');
        }

        await tx.kyc.update({
          where: { id: kycId },
          data: {
            status: KycStatus.Rejected,
            rejectionReason: data.rejectionReason,
            reviewedAt: new Date(),
            reviewedById: user.id,
          },
        });
        await this.notificationService._sendNotification({
          code: NotificationCode.KYC_REJECTED,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          userIds: [findUser!.id],
        });

        await this.activityService.createLog(
          {
            type: ActivityType.KYC_REJECTED,
            actorType: ACTOR_TYPE_MAP[user.type] ?? ActivityActorType.SYSTEM,
            actorId: user.id, // who perform the action
            entityType: ActivityEntityType.KYC,
            entityId: kycId,
            targetId: kyc.accountId,
            label: 'KYC rejected',
            metadata: {
              message: 'Rejected KYC details',
            },
          },
          { tx },
        );

        return { message: 'KYC rejected successfully' };
      }
      throw new Error('Invalid KYC action');
    });
  }

  async getCompanyKycByKycId(kycId: number) {
    const kyc = await this.prisma.companyKyc.findUnique({
      where: { id: kycId },
      select: {
        id: true,
        accountId: true,

        kybStatus: true,
        kycStatus: true,
        overallStatus: true,
        kybSubmittedAt: true,
        kycSubmittedAt: true,
        kybReviewedAt: true,
        kycReviewedAt: true,
      },
    });

    if (!kyc) {
      throw new Error('Company KYC not found');
    }

    const company = await this.prisma.company.findFirst({
      where: { accountId: kyc.accountId },
      select: {
        id: true,
        legalEntityName: true,
        tradeName: true,
        entityType: true,
        cinOrTradeLicenseNo: true,
        dateOfIncorporation: true,
        companyEmail: true,
        companyPhone: true,
        websiteUrl: true,
        isVerified: true,

        registeredAddress: true,
        operationalAddress: true,
        meta: true,

        documents: {
          select: {
            id: true,
            documentTypeId: true,
            documentIdentifier: true,
            documentType: {
              select: {
                name: true,
              },
            },
            url: true,
            isVerified: true,
          },
        },
      },
    });

    if (!company) {
      throw new Error('Company not found for this KYC');
    }

    const directors = await this.prisma.director.findMany({
      where: { companyId: company.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roleInCompany: true,
        dateOfBirth: true,
        nationality: true,
        email: true,
        mobileNumber: true,
        isVerified: true,

        currentAddress: true,
        permanentAddress: true,
        directorMeta: true,

        documents: {
          select: {
            id: true,
            documentTypeId: true,
            documentIdentifier: true,
            documentType: {
              select: {
                name: true,
              },
            },
            url: true,
            isVerified: true,
          },
        },
      },
    });

    const mapDocs = (docs: any[]) =>
      docs.map((d) => ({
        ...d,
        url: this.storageService.resolveFileUrl(d.url),
        documentName: d.documentType?.name,
        documentDeveloperName: d.documentType?.developerName,
      }));

    return {
      kycId: kyc.id,
      accountId: kyc.accountId,

      statuses: {
        kybStatus: kyc.kybStatus,
        kycStatus: kyc.kycStatus,
        overallStatus: kyc.overallStatus,
        kybSubmittedAt: kyc.kybSubmittedAt,
        kycSubmittedAt: kyc.kycSubmittedAt,
        kybReviewedAt: kyc.kybReviewedAt,
        kycReviewedAt: kyc.kycReviewedAt,
      },

      company: {
        id: company.id,
        legalEntityName: company.legalEntityName,
        tradeName: company.tradeName,
        entityType: company.entityType,
        cinOrTradeLicenseNo: company.cinOrTradeLicenseNo,
        dateOfIncorporation: company.dateOfIncorporation,
        email: company.companyEmail,
        phone: company.companyPhone,
        websiteUrl: company.websiteUrl,
        isVerified: company.isVerified,

        registeredAddress: company.registeredAddress,
        operationalAddress: company.operationalAddress,
        meta: company.meta,
        documents: mapDocs(company.documents),
      },

      directors: directors.map((d) => ({
        id: d.id,
        name: `${d.firstName} ${d.lastName}`,
        roleInCompany: d.roleInCompany,
        dateOfBirth: d.dateOfBirth,
        nationality: d.nationality,
        email: d.email,
        mobileNumber: d.mobileNumber,
        isVerified: d.isVerified,

        currentAddress: d.currentAddress,
        permanentAddress: d.permanentAddress,

        kycIdentifiers: d.directorMeta,
        documents: mapDocs(d.documents),
      })),
    };
  }

  async getCompanyKycList(options?: {
    status?: KycStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.CompanyKycWhereInput = {
      ...(options?.status && {
        kybStatus: options?.status,
        kycStatus: options.status,
      }),
    };

    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.CompanyKycWhereInput[] => [
        {
          account: {
            OR: [
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

    const totalUsers = await this.prisma.companyKyc.count({
      where,
    });
    const users = await this.prisma.companyKyc.findMany({
      where,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      include: {
        account: true,
      },
      skip: pagination.skip,
      take: pagination.take,
    });
    const response = await this.utilsService.batchable(users, async (user) => {
      return {
        ...user,
      };
    });

    return {
      count: totalUsers,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async verifyCompanyKyc(
    kycId: number,
    trusteeId: number,
    data: VerifyCompanyKycDto,
  ) {
    const record = await this.prisma.companyKyc.findUnique({
      where: { id: kycId },
      select: {
        kybStatus: true,
        kycStatus: true,
      },
    });

    if (!record) {
      throw new Error('KYC record not found');
    }

    if (
      record.kybStatus !== KycStatus.Submitted ||
      record.kycStatus !== KycStatus.Submitted
    ) {
      throw new Error('KYC/KYB is not done');
    }

    return this.prisma.companyKyc.update({
      where: { id: kycId },
      data: {
        kybStatus: data.status,
        kycStatus: data.status,
        overallStatus: data.status,
        remarks: data.remarks,
        kybReviewedAt: new Date(),
        kycReviewedAt: new Date(),
        kybReviewedBy: trusteeId,
        kycReviewedBy: trusteeId,
      },
    });
  }

  async mapKycResponse(kyc: any) {
    const account = kyc.account;

    return {
      status: kyc.status,
      submittedAt: kyc.submittedAt,
      verifiedAt: kyc.verifiedAt,
      verifier: kyc.verifier,

      personalInfo: {
        panNumber: account.meta?.panNumber ?? null,
        passportNumber: account.meta?.passportNumber ?? null,
        emiratiId: account.meta?.emiratiId ?? null,
        occupation: account.meta?.occupation ?? null,
        monthlyIncome: account.meta?.monthlyIncome ?? null,
        dateOfBirth: account.meta?.dateOfBirth ?? null,
      },

      address: account.currentAddress ?? null,

      documents: (account.entityDocument ?? []).map((doc: any) => ({
        id: doc.id,
        type: doc.documentType?.name ?? null,
        key: doc.documentType?.developerName ?? null,
        url: doc.url ? this.storageServicee.resolveFileUrl(doc.url) : null,
        uploadedAt: doc.uploadedAt,
        isVerified: doc.isVerified,
      })),
    };
  }

  async getKycByAccountId(accountId: number) {
    const kyc = await this.prisma.kyc.findUnique({
      where: { accountId },
      include: {
        account: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
            countryId: true,
            isDocumentUploaded: true,
            meta: {
              select: {
                panNumber: true,
                passportNumber: true,
                emiratiId: true,
                occupation: true,
                monthlyIncome: true,
                dateOfBirth: true,
              },
            },
            currentAddress: true,
            entityDocument: {
              orderBy: { uploadedAt: 'desc' },
              include: {
                documentType: {
                  select: {
                    id: true,
                    name: true,
                    developerName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!kyc) {
      throw new Error('KYC not found');
    }

    return this.mapKycResponse(kyc);
  }
}
