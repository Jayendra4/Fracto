import { join } from 'node:path';
import { Cache } from 'cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  AdminNotificationCode,
  AuthorizationService,
  NotificationAudience,
  StorageService,
  UserType,
  UtilsService,
  ValidatedUser,
  getAccessGuardCacheKey,
} from '@Common';
import { userConfigFactory } from '@Config';
import { PrismaService } from '../prisma';
import {
  OtpContext,
  OtpService,
  SendCodeResponse,
  VerifyCodeResponse,
} from '../otp';
import {
  Account,
  AccountMeta,
  AccountStatus,
  AccountType,
  EntityDocument,
  KycStatus,
  KycVerifier,
  NotificationType,
  OtpTransport,
  Prisma,
  ReferralApprovalStatus,
  ReferralType,
  ReferralUsesType,
  UserEntrySource,
} from '../generated/prisma/client';
import { KycDocumentUploadDto, UpdateKycDto } from './dto';
import { WalletsService } from '../wallets';
import { NotificationService } from '../notification';
import { BankAccountService } from '../bank-account/bank-account.service';
import { UpiAccountService } from '../upi-account/upi-account.service';
import { ActivityService } from '../activity';
import {
  ActivityActorType,
  ActivityEntityType,
  ActivityType,
  ACTOR_TYPE_MAP,
} from '../activity/activity.types';

@Injectable()
export class AccountsService {
  constructor(
    @Inject(userConfigFactory.KEY)
    private readonly config: ConfigType<typeof userConfigFactory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly utilsService: UtilsService,
    private readonly storageService: StorageService,
    private readonly otpService: OtpService,
    private readonly notificationService: NotificationService,
    private readonly bankAccountService: BankAccountService,
    private readonly upiAccountService: UpiAccountService,
    private readonly walletsService: WalletsService,
    private readonly activityService: ActivityService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  private getProfileImageUrl(profileImage: string): string {
    return this.storageService.getFileUrl(
      profileImage,
      this.config.profileImagePath,
    );
  }

  private hashPassword(password: string): { salt: string; hash: string } {
    const salt = this.utilsService.generateSalt(this.config.passwordSaltLength);
    const hash = this.utilsService.hashPassword(
      password,
      salt,
      this.config.passwordHashLength,
    );
    return { salt, hash };
  }

  private isValidUsername(username: string): boolean {
    return /^[a-z][a-z0-9_]{3,20}$/.test(username);
  }

  async isEmailExist(
    email: string,
    excludeaccountId?: number,
  ): Promise<boolean> {
    return (
      (await this.prisma.account.count({
        where: {
          email: email.toLowerCase(),
          NOT: {
            id: excludeaccountId,
          },
        },
      })) !== 0
    );
  }

  async isMobileExist(
    mobile: string,
    excludeaccountId?: number,
  ): Promise<boolean> {
    return (
      (await this.prisma.account.count({
        where: {
          mobile,
          NOT: {
            id: excludeaccountId,
          },
        },
      })) !== 0
    );
  }

  async getById(accountId: number) {
    return await this.prisma.account.findUniqueOrThrow({
      where: {
        id: accountId,
      },
      include: {
        entityDocument: {
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
        permanentAddress: true,
        currentAddress: true,
        kyc: true,
        companies: {
          include: {
            directors: {
              include: {
                directorMeta: true,
                permanentAddress: {
                  select: {
                    addressLine1: true,
                    addressLine2: true,
                    city: true,
                    state: true,
                    pincode: true,
                  },
                },
                documents: {
                  include: {
                    documentType: {
                      select: { id: true, name: true, developerName: true },
                    },
                  },
                },
              },
            },
          },
        },
        meta: {
          select: {
            passportNumber: true,
            panNumber: true,
            emiratiId: true,
            dateOfBirth: true,
            monthlyIncome: true,
            occupation: true,
          },
        },
      },
    });
  }

  async getDocumentsById(accountId: number): Promise<EntityDocument[]> {
    return await this.prisma.entityDocument.findMany({
      where: {
        accountId,
      },
    });
  }

  async getByEmail(email: string): Promise<Account | null> {
    return await this.prisma.account.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async getByMobile(mobile: string): Promise<Account | null> {
    return await this.prisma.account.findUnique({
      where: {
        mobile,
      },
    });
  }

  async getMetaById(accountId: number): Promise<AccountMeta> {
    return await this.prisma.accountMeta.findUniqueOrThrow({
      where: {
        accountId,
      },
    });
  }

  async getMetaByEmail(email: string): Promise<AccountMeta> {
    return await this.prisma.accountMeta.findFirstOrThrow({
      where: {
        account: {
          email: email.toLowerCase(),
        },
      },
    });
  }

  async validateCredentials(
    emailOrMobile: string,
    password: string,
    allowedTypes?: AccountType[],
  ): Promise<ValidatedUser | false | null> {
    let user = await this.getByEmail(emailOrMobile);
    if (!user) user = await this.getByMobile(emailOrMobile);
    if (!user) return null;
    if (user.status !== AccountStatus.Active) {
      throw new Error(
        'Your account has been temporarily suspended/blocked by the system. Please contact customer support for assistance',
      );
    }
    await this.authorizationService.assertRoleActive(user.roleId);

    if (allowedTypes && !allowedTypes.includes(user.type)) {
      return null;
    }

    const userMeta = await this.getMetaById(user.id);
    const passwordHash = this.utilsService.hashPassword(
      password,
      userMeta.passwordSalt || '',
      userMeta.passwordHash
        ? userMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );
    if (userMeta.passwordHash !== passwordHash) {
      return false;
    }

    return {
      id: user.id,
      type: user.type,
    };
  }

  getRewardLimitByReferralType(type: ReferralUsesType): number | null {
    switch (type) {
      case ReferralUsesType.InvestorSignup:
        return 5;

      case ReferralUsesType.AssetRegistration:
        return 1;

      case ReferralUsesType.AssetOwnerSignup:
        return 1;

      case ReferralUsesType.AssetPromotion:
        return null; // unlimited

      default:
        return null;
    }
  }

  private validateReferralUsage(params: {
    entrySource: UserEntrySource;
    accountType: AccountType;
  }) {
    const { entrySource, accountType } = params;

    if (entrySource === UserEntrySource.AssetOwner) {
      if (accountType !== AccountType.Business) {
        throw new Error(
          'Asset owner referral code can only be used for Business+ registration',
        );
      }
      return;
    }

    if (entrySource === UserEntrySource.Investor) {
      // Allowed for all these account types
      const allowedAccountTypes: AccountType[] = [
        AccountType.CorporateInvestor,
        AccountType.AssetOwner,
        AccountType.Company,
        AccountType.Business,
      ];

      if (!allowedAccountTypes.includes(accountType)) {
        throw new Error(
          'Plain referral code is not applicable for this account type',
        );
      }
    }
  }

  private async detectEntrySource(
    tx: Prisma.TransactionClient,
    referralCode?: string,
  ): Promise<{
    entrySource: UserEntrySource | null;
    campaign: {
      id: number;
      ownerId: number;
      referralType: ReferralType;
    } | null;
  }> {
    if (!referralCode) {
      return { entrySource: null, campaign: null };
    }

    const campaign = await tx.referralCampaign.findFirst({
      where: {
        code: referralCode,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: {
        id: true,
        ownerId: true,
        referralType: true,
      },
    });

    if (!campaign) {
      throw new Error('Invalid or expired referral code');
    }

    if (campaign.referralType === ReferralType.Plain) {
      return {
        entrySource: UserEntrySource.Investor,
        campaign,
      };
    }

    if (campaign.referralType === ReferralType.AssetOwnerReferralCode) {
      return {
        entrySource: UserEntrySource.AssetOwner,
        campaign,
      };
    }

    return { entrySource: null, campaign: null };
  }

  private resolveRewardByEntrySource(entrySource: UserEntrySource): {
    referralUsesType: ReferralUsesType;
    allowedReferralType: ReferralType;
  } {
    // Investor signup plain referral
    if (entrySource === UserEntrySource.Investor) {
      return {
        referralUsesType: ReferralUsesType.InvestorSignup,
        allowedReferralType: ReferralType.Plain,
      };
    }

    // Asset owner via broker invite
    if (entrySource === UserEntrySource.AssetOwner) {
      return {
        referralUsesType: ReferralUsesType.AssetOwnerSignup,
        allowedReferralType: ReferralType.AssetOwnerReferralCode,
      };
    }

    throw new Error('Referral entry source does not match final account type');
  }

  private async finalizeAssetOwnerInvite(
    tx: Prisma.TransactionClient,
    campaign: { id: number; ownerId: number },
    assetOwnerId: number,
  ) {
    await tx.assetOwnerInvite.updateMany({
      where: {
        campaignId: campaign.id,
        brokerId: campaign.ownerId,
        assetOwnerId: null,
        assetOwnerStatus: ReferralApprovalStatus.Pending,
      },
      data: {
        assetOwnerId,
        // assetOwnerStatus: ReferralApprovalStatus.Approved,
      },
    });

    await tx.asset.updateMany({
      where: { assetOwnerInvite: { assetOwnerId: assetOwnerId } },
      data: {
        accountId: assetOwnerId,
      },
    });

    await tx.referralCampaign.update({
      where: { id: campaign.id },
      data: { isActive: false },
    });
  }

  private async applyReferralOnSignup(
    tx: Prisma.TransactionClient,
    data: {
      referralCode?: string;
      accountType: AccountType;
      accountId: number;
    },
  ) {
    const { referralCode, accountType, accountId } = data;

    const { entrySource, campaign } = await this.detectEntrySource(
      tx,
      referralCode,
    );

    if (!entrySource || !campaign) return;

    this.validateReferralUsage({
      entrySource,
      accountType,
    });

    if (campaign.ownerId === accountId) {
      throw new Error('Self referral is not allowed');
    }

    const { referralUsesType } = this.resolveRewardByEntrySource(entrySource);

    if (referralUsesType === ReferralUsesType.AssetOwnerSignup) {
      const owner = await tx.account.findUnique({
        where: { id: campaign.ownerId },
        select: { type: true },
      });

      if (owner?.type !== AccountType.Broker) {
        throw new Error('Only brokers can invite asset owners');
      }
    }

    const alreadyUsed = await tx.referralUsage.findUnique({
      where: {
        campaignId_referredUserId_referralUsesType: {
          campaignId: campaign.id,
          referredUserId: accountId,
          referralUsesType,
        },
      },
    });

    if (alreadyUsed) {
      throw new Error('Referral already applied');
    }

    const rewardLimit = this.getRewardLimitByReferralType(referralUsesType);

    await tx.referralUsage.create({
      data: {
        campaignId: campaign.id,
        referredUserId: accountId,
        referralUsesType,
        rewardLimit,
      },
    });

    await tx.userInviteContext.upsert({
      where: { accountId },
      update: {
        entrySource,
        referralCode,
        referralCampaignId: campaign.id,
        accountType: accountType,
      },
      create: {
        accountId,
        entrySource,
        referralCode,
        referralCampaignId: campaign.id,
        accountType: accountType,
      },
    });

    if (referralUsesType === ReferralUsesType.AssetOwnerSignup) {
      await this.finalizeAssetOwnerInvite(tx, campaign, accountId);
    }
    return campaign.ownerId;
  }

  async create(data: {
    firstname: string;
    lastname: string;
    email: string;
    password?: string;
    dialCode?: string;
    mobile?: string;
    countryId: number;
    googleId?: string;
    profileImage?: string;
    createdById?: number;
    accountType?: AccountType;
    referralCode?: string;
  }): Promise<Account> {
    if (await this.isEmailExist(data.email)) {
      throw new Error('Email already exist');
    }

    if (data.mobile && (await this.isMobileExist(data.mobile))) {
      throw new Error('Mobile already exist');
    }

    let passwordSalt: string | null = null;
    let passwordHash: string | null = null;

    if (data.password) {
      const { salt, hash } = this.hashPassword(data.password);
      passwordSalt = salt;
      passwordHash = hash;
    }

    const user = await this.prisma.$transaction(async (tx) => {
      const user = await tx.account.create({
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email.toLowerCase(),
          dialCode: data.dialCode,
          mobile: data.mobile,
          profileImage: data.profileImage,
          countryId: data.countryId,
          createdById: data.createdById,
          type: data.accountType ?? AccountType.CorporateInvestor,
          meta: {
            create: {
              passwordHash,
              passwordSalt,
              googleId: data.googleId,
            },
          },
        },
      });

      await this.walletsService.create(user.id, user.type, { tx });

      let referredByBrokerId: number | null = null;
      if (user && data.referralCode) {
        const brokerId = await this.applyReferralOnSignup(tx, {
          referralCode: data?.referralCode,
          accountType: user.type,
          accountId: user.id,
        });

        referredByBrokerId = brokerId ?? null;
      }

      await tx.referralCampaign.create({
        data: {
          code: this.utilsService.generateReferralCode(user.firstname ?? 'USR'),
          ownerId: user.id,
          referralType: ReferralType.Plain,
          isActive: true,
        },
      });
      await this.activityService.createLog({
        type: ActivityType.SIGNUP,
        actorType: ACTOR_TYPE_MAP[user.type] ?? ActivityActorType.SYSTEM,
        actorId: user.id,
        entityType: ActivityEntityType.USER,
        entityId: user.id,
        targetId: referredByBrokerId ?? user.id, // brokerId if referral exists
        label: referredByBrokerId
          ? `${user.firstname} ${user.lastname ?? ''} successfully created an account using a referral from a broker.`
          : `${user.firstname} ${user.lastname ?? ''} successfully created a new user account on the platform.`,
        metadata: {
          email: user.email,
          referralCode: data?.referralCode ?? null,
          isReferredUser: Boolean(referredByBrokerId),
        },
      });

      return user;
    });

    return user;
  }

  async getOrCreateByGoogle(data: {
    googleId: string;
    email: string;
    firstname?: string;
    lastname?: string;
    profileImage?: string;
  }): Promise<ValidatedUser> {
    let user = await this.prisma.account.findFirst({
      where: {
        meta: {
          googleId: data.googleId,
        },
      },
    });
    if (!user) {
      const isEmailExist = await this.isEmailExist(data.email);
      if (isEmailExist) {
        user = await this.prisma.account.update({
          data: {
            meta: {
              update: {
                googleId: data.googleId,
              },
            },
          },
          where: { email: data.email.toLowerCase() },
        });
      } else {
        user = await this.create({
          firstname: data.firstname || '',
          lastname: data.lastname || '',
          email: data.email,
          profileImage: data.profileImage,
          googleId: data.googleId,
          countryId: 1,
        });
      }
    }

    return {
      id: user.id,
      type: user.type,
    };
  }

  private extractFilename(value: string): string {
    try {
      // If it's a full URL
      if (value.startsWith('http')) {
        return value.split('/').pop()!;
      }
      // If already a filename
      return value;
    } catch {
      return value;
    }
  }

  // async getProfile(accountId: number) {
  //   const user = await this.getById(accountId);

  //   if (user.entityDocument) {
  //     user.entityDocument.forEach((d) => {
  //       if (d.url) {
  //         const filename = this.extractFilename(d.url);
  //         d.url = this.storageService.getFileUrl(filename);
  //       }
  //     });
  //   }

  //   if (user.profileImage) {
  //     const filename = this.extractFilename(user.profileImage);
  //     user.profileImage = this.getProfileImageUrl(filename);
  //   }

  //   const paymentOwner = await this.prisma.paymentOwner.findFirst({
  //     where: {
  //       ownerId: accountId,
  //     },
  //     include: {
  //       bankAccounts: true,
  //       upiAccounts: true,
  //     },
  //   });

  //   const isBankAdded = !!paymentOwner?.bankAccounts?.length;
  //   const isUpiAdded = !!paymentOwner?.upiAccounts?.length;

  //   const account = await this.prisma.account.findUnique({
  //     where: { id: accountId },
  //     include: {
  //       currentAddress: true,
  //     },
  //   });

  //   let kycStatus = KycStatus.NOT_INITIATED;

  //   if (
  //     account?.firstname ||
  //     account?.lastname ||
  //     account?.isDocumentUploaded
  //   ) {
  //     kycStatus = KycStatus.PENDING;
  //   }

  //   const isKycApproved =
  //     account?.firstname &&
  //     account?.lastname &&
  //     account?.countryId &&
  //     account?.isDocumentUploaded &&
  //     account?.currentAddressId;

  //   if (isKycApproved) {
  //     kycStatus = KycStatus.APPROVED;
  //   }

  //   const company = await this.prisma.company.findFirst({
  //     where: { accountId },
  //   });

  //   const kybStatus = company ? KybStatus.APPROVED : KybStatus.PENDING;

  //   return {
  //     ...user,
  //     isBankAdded,
  //     isUpiAdded,
  //     kycStatus,
  //     kybStatus,
  //   };
  // }

  async getProfile(accountId: number) {
    const user = await this.getById(accountId);
    const companiesWithResolvedUrls = user.companies?.map((company) => ({
      ...company,
      directors: company.directors?.map((director) => ({
        ...director,
        documents: director.documents?.map((doc) => ({
          ...doc,
          url: doc.url
            ? this.storageService.getFileUrl(this.extractFilename(doc.url))
            : null,
        })),
      })),
    }));
    const SIGNUP_REFERRAL_TYPES: ReferralUsesType[] = [
      ReferralUsesType.InvestorSignup,
      ReferralUsesType.AssetOwnerSignup,
    ];
    const [
      paymentOwner,
      ownReferralCampaign,
      referralUsage,
      accountMeta,
      rwaForm,
      brokerReferrals,
    ] = await Promise.all([
      this.prisma.paymentOwner.findFirst({
        where: { ownerId: accountId },
        include: {
          bankAccounts: true,
          upiAccounts: true,
        },
      }),

      // user own referral code
      this.prisma.referralCampaign.findFirst({
        where: { ownerId: accountId },
        select: { code: true },
      }),

      // referred-code check if signup referral type exists)
      this.prisma.referralUsage.findFirst({
        where: {
          referredUserId: accountId,
          referralUsesType: {
            in: SIGNUP_REFERRAL_TYPES,
          },
        },
        select: {
          referralUsesType: true,
          campaign: {
            select: {
              code: true,
            },
          },
        },
      }),

      this.prisma.accountMeta.findUnique({
        where: { accountId },
        select: {
          licenseNumber: true,
          licenseExpiry: true,
        },
      }),

      this.prisma.asset.aggregate({
        where: { accountId },
        _count: {
          id: true,
        },
      }),

      this.prisma.asset.aggregate({
        where: {
          isBrokerReferred: true,
          OR: [
            {
              assetOwnerInvite: {
                brokerId: accountId,
              },
            },
            {
              accountId: accountId,
            },
          ],
        },
        _count: {
          id: true,
        },
      }),
    ]);

    let hasLicense = false;
    if (user.type === AccountType.Broker) {
      hasLicense = Boolean(
        accountMeta?.licenseNumber && accountMeta?.licenseExpiry,
      );
    }

    const entityDocuments =
      user.entityDocument?.map((d) => {
        let fileUrl: string | null = null;

        if (d.url) {
          const filename = this.extractFilename(d.url);
          fileUrl = this.storageService.getFileUrl(filename);
        }

        return {
          id: d.id,
          url: fileUrl,
          isVerified: d.isVerified,
          uploadedAt: d.uploadedAt,
          verifiedAt: d.verifiedAt,
          remark: d.remark,
          documentName: d.documentType?.name ?? null,
          documentDeveloperName: d.documentType?.developerName ?? null,
        };
      }) ?? [];

    const profileImage = user.profileImage
      ? this.getProfileImageUrl(this.extractFilename(user.profileImage))
      : null;

    const isBankAdded = Boolean(paymentOwner?.bankAccounts?.length);
    const isUpiAdded = Boolean(paymentOwner?.upiAccounts?.length);

    let kycStatus: KycStatus = KycStatus.Draft;
    let kybStatus: KycStatus = KycStatus.Draft;

    if (user.type === AccountType.Company) {
      const companyKyc = await this.prisma.companyKyc.findUnique({
        where: { accountId },
        select: {
          kycStatus: true,
          kybStatus: true,
        },
      });

      kycStatus = companyKyc?.kycStatus ?? KycStatus.Draft;
      kybStatus = companyKyc?.kybStatus ?? KycStatus.Draft;
    } else {
      const kyc = await this.prisma.kyc.findFirst({
        where: { accountId },
        orderBy: { createdAt: 'desc' },
        select: { status: true },
      });

      kycStatus = kyc?.status ?? KycStatus.Draft;
    }

    const rwaFormCount = rwaForm._count.id ?? 0;
    const brokerReferredAssetsCount = brokerReferrals._count.id ?? 0;
    const hasSubmittedRwaForm = rwaFormCount > 0;

    return {
      ...user,
      companies: companiesWithResolvedUrls,
      entityDocument: entityDocuments,
      // user own referral code
      referralCode: ownReferralCampaign?.code ?? null,
      // referred code
      referredCode: referralUsage?.campaign?.code ?? null,
      entrySource: referralUsage
        ? referralUsage.referralUsesType === ReferralUsesType.AssetOwnerSignup
          ? UserEntrySource.AssetOwner
          : UserEntrySource.Investor
        : null,
      profileImage,
      isBankAdded,
      isUpiAdded,
      hasLicense,
      ...(user.type === AccountType.Broker &&
        hasLicense && {
          licenseNumber: accountMeta?.licenseNumber,
          licenseExpiry: accountMeta?.licenseExpiry,
        }),
      hasSubmittedRwaForm,
      rwaFormCount,
      brokerReferredAssetsCount,
      kycStatus,
      kybStatus,
      kybId: user.companies.length > 0 ? user.companies[0].id : null,
    };
  }

  async getBankAccountDetails(accountId: number) {
    const account = await this.getById(accountId);
    const owner = await this.bankAccountService.getOrCreateOwner(
      account.type,
      account.id,
    );
    const paymentOwnerId = owner.id;
    return await this.bankAccountService.getAllAccounts({
      paymentOwnerId,
    });
  }

  async getUpiAccountDetails(accountId: number) {
    const account = await this.getById(accountId);
    const owner = await this.upiAccountService.getOrCreateOwner(
      account.type,
      account.id,
    );
    const paymentOwnerId = owner.id;
    return await this.upiAccountService.getAllUpiAccounts({
      paymentOwnerId,
    });
  }

  async updateProfileDetails(
    data: {
      accountId: number;
      username?: string;
      firstname?: string;
      lastname?: string;
      email?: string;
      dialCode?: string;
      mobile?: string;
      country?: string;
      status?: AccountStatus;
      type?: AccountType;
      isDeleted?: boolean;
      meta?: {
        occupation?: string;
        monthlyIncome?: string;
        panNumber?: string;
        passportNumber?: string;
        dateOfBirth?: string;
      };
    },
    options?: { tx?: Prisma.TransactionClient },
  ): Promise<Account> {
    const prismaClient = options?.tx ? options.tx : this.prisma;

    if (data.email && (await this.isEmailExist(data.email, data.accountId))) {
      throw new Error('Email already exist');
    }
    if (data.username && !this.isValidUsername(data.username)) {
      throw new Error('Invalid username');
    }
    if (
      data.mobile &&
      (await this.isMobileExist(data.mobile, data.accountId))
    ) {
      throw new Error('Mobile already exist');
    }

    const updatedAccount = await prismaClient.account.update({
      where: { id: data.accountId },
      data: {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email?.toLowerCase(),
        dialCode: data.dialCode,
        mobile: data.mobile,
        type: data.type,
        status: data.status,
        isDeleted: data.isDeleted,
      },
    });

    if (data.meta) {
      await prismaClient.accountMeta.upsert({
        where: {
          accountId: data.accountId,
        },
        update: {
          occupation: data.meta.occupation,
          monthlyIncome: data.meta.monthlyIncome,
          panNumber: data.meta.panNumber ?? null,
          passportNumber: data.meta.passportNumber,
          dateOfBirth: data.meta.dateOfBirth
            ? new Date(data.meta.dateOfBirth)
            : null,
        },
        create: {
          accountId: data.accountId,
          occupation: data.meta.occupation,
          monthlyIncome: data.meta.monthlyIncome,
          panNumber: data.meta.panNumber ?? null,
          passportNumber: data.meta.passportNumber,
          dateOfBirth: data.meta.dateOfBirth
            ? new Date(data.meta.dateOfBirth)
            : null,
        },
      });
    }

    return updatedAccount;
  }

  async updateProfileDetailsByAdministrator(data: {
    accountId: number;
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    dialCode?: string;
    mobile?: string;
    country?: string;
    password?: string;
    isDeleted?: boolean;
    status?: AccountStatus;
  }) {
    await this.prisma.$transaction(async (tx) => {
      const user = await this.updateProfileDetails(
        {
          accountId: data.accountId,
          username: data.username,
          firstname: data.firstname,
          lastname: data.lastname,
          email: data.email,
          dialCode: data.dialCode,
          mobile: data.mobile,
          country: data.country,
          isDeleted: data.isDeleted,
          status: data.status,
        },
        { tx },
      );

      if (data.password) {
        const { salt, hash } = this.hashPassword(data.password);
        const passwordSalt = salt;
        const passwordHash = hash;

        await tx.accountMeta.update({
          data: {
            passwordHash,
            passwordSalt,
          },
          where: {
            accountId: data.accountId,
          },
        });
      }

      return user;
    });
  }

  async updateProfileImage(
    accountId: number,
    profileImage: string,
  ): Promise<{ profileImage: string | null }> {
    const user = await this.getById(accountId);

    return await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: accountId },
        data: { profileImage },
      });

      if (user.profileImage) {
        // Remove previous profile image from storage
        await this.storageService.removeFile(
          join(this.config.profileImagePath, user.profileImage),
        );
      }
      await this.storageService.move(
        profileImage,
        this.config.profileImagePath,
      );

      return {
        profileImage: this.getProfileImageUrl(profileImage),
      };
    });
  }

  async changePassword(
    accountId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<Account> {
    const user = await this.getById(accountId);
    const userMeta = await this.getMetaById(user.id);

    const hashedPassword = this.utilsService.hashPassword(
      oldPassword,
      userMeta.passwordSalt || '',
      userMeta.passwordHash
        ? userMeta.passwordHash.length / 2
        : this.config.passwordHashLength,
    );

    if (hashedPassword !== userMeta.passwordHash)
      throw new Error('Password does not match');

    const { salt, hash } = this.hashPassword(newPassword);
    const passwordSalt = salt;
    const passwordHash = hash;

    await this.prisma.accountMeta.update({
      data: {
        passwordHash,
        passwordSalt,
      },
      where: {
        accountId,
      },
    });
    return user;
  }

  async sendResetPasswordVerificationCode(email?: string, mobile?: string) {
    let user: Account | null | undefined;

    if (email) user = await this.getByEmail(email);
    if (!user && mobile) user = await this.getByMobile(mobile);
    if (!user) throw new Error('Account does not exist');

    const response: { email?: SendCodeResponse; mobile?: SendCodeResponse } =
      {};

    if (mobile) {
      response.mobile = await this.otpService.send({
        context: OtpContext.ResetPassword,
        target: mobile,
        transport: OtpTransport.Mobile,
      });
    }
    if (email) {
      response.email = await this.otpService.send({
        context: OtpContext.ResetPassword,
        target: email,
        transport: OtpTransport.Email,
        transportParams: {
          username: user.firstname.concat(' ', user.lastname),
        },
      });
    }

    return response;
  }

  async resetPassword(
    code: string,
    newPassword: string,
    mobile?: string,
    email?: string,
  ): Promise<Account> {
    // Get user
    let user: Account | null | undefined;
    if (email) {
      user = await this.getByEmail(email);
    }
    if (!user && mobile) {
      user = await this.getByMobile(mobile);
    }
    if (!user) throw new Error('User not found');

    // Validate code
    let response: VerifyCodeResponse | null | undefined;

    if (mobile)
      response = await this.otpService.verify(
        code,
        mobile,
        OtpTransport.Mobile,
      );
    if (email)
      response = await this.otpService.verify(code, email, OtpTransport.Email);
    if (!response) throw new Error('Invalid email or mobile');
    if (response.status === false)
      throw new Error('Incorrect verification code');

    // Reset password
    const { salt: passwordSalt, hash: passwordHash } =
      this.hashPassword(newPassword);

    await this.prisma.accountMeta.update({
      data: {
        passwordSalt,
        passwordHash,
      },
      where: { accountId: user.id },
    });
    return user;
  }

  async setStatus(accountId: number, status: AccountStatus): Promise<Account> {
    await this.cacheManager.del(
      getAccessGuardCacheKey({ id: accountId, type: UserType.User }),
    );
    return await this.prisma.account.update({
      data: { status },
      where: {
        id: accountId,
      },
    });
  }

  async getAll(options?: {
    accountType?: AccountType;
    kycStatus?: KycStatus;
    search?: string;
    skip?: number;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    count: number;
    skip: number;
    take: number;
    data: Account[];
  }> {
    const search = options?.search?.trim();
    const pagination = { skip: options?.skip || 0, take: options?.take || 10 };
    const where: Prisma.AccountWhereInput = {
      type: options?.accountType,
      isDeleted: false,
    };
    if (options?.fromDate || options?.toDate) {
      where.createdAt = {};

      if (options.fromDate) {
        where.createdAt.gte = new Date(options.fromDate);
      }

      if (options.toDate) {
        where.createdAt.lte = new Date(options.toDate);
      }
    }
    if (search) {
      const buildSearchFilter = (
        search: string,
      ): Prisma.AccountWhereInput[] => [
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

    if (options?.kycStatus) {
      where.OR = [
        {
          kyc: {
            status: options.kycStatus,
          },
        },
        {
          companyKyc: {
            overallStatus: options.kycStatus,
          },
        },

        ...(options.kycStatus === KycStatus.Draft
          ? [
              {
                AND: [
                  { type: { not: AccountType.Company } }, // Broker, Individual etc
                  { kyc: null }, // no kyc record = Draft
                ],
              },
              {
                AND: [
                  { type: AccountType.Company },
                  { companyKyc: null }, // no companyKyc record = Draft
                ],
              },
            ]
          : []),
      ];
    }

    const totalUsers = await this.prisma.account.count({
      where,
    });

    const users = await this.prisma.account.findMany({
      where,
      orderBy: { createdAt: Prisma.SortOrder.desc },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        kyc: {
          select: {
            status: true,
          },
        },
        companyKyc: {
          select: {
            kybStatus: true,
            kycStatus: true,
            overallStatus: true,
          },
        },
        companies: {
          include: {
            directors: true,
          },
        },
      },
    });
    const response = await this.utilsService.batchable(users, async (user) => {
      const baseResponse = {
        ...user,
        profileImage: user.profileImage
          ? this.getProfileImageUrl(user.profileImage)
          : null,
      };
      if (user.type === AccountType.Company) {
        return {
          ...baseResponse,
          companyKyc: {
            kybStatus: user.companyKyc?.kybStatus ?? KycStatus.Draft,
            kycStatus: user.companyKyc?.kycStatus ?? KycStatus.Draft,
            overallStatus: user.companyKyc?.overallStatus ?? KycStatus.Draft,
          },
          kyc: undefined,
        };
      }

      return {
        ...baseResponse,
        kycStatus: user.kyc?.status ?? KycStatus.Draft,
        kyc: undefined,
        companyKyc: undefined,
      };
    });
    return {
      count: totalUsers,
      skip: pagination.skip,
      take: pagination.take,
      data: response,
    };
  }

  async updateKyc(
    accountId: number,
    type: AccountType | UserType,
    data: UpdateKycDto,
  ) {
    const accountData = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { firstname: true, lastname: true },
    });
    const kyc = await this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id: accountId },
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          countryId: data.countryId,
          isDocumentUploaded: data.documents?.length ? true : undefined,
        },
      });

      if (
        type === AccountType.Broker &&
        (!data.licenseNumber || !data.licenseExpiry)
      ) {
        throw new Error(
          'License number and expiry date are required for broker kyc ',
        );
      }

      if (
        data.panNumber ||
        data.passportNumber ||
        data.emiratiId ||
        data.occupation ||
        data.monthlyIncome ||
        data.dateOfBirth
      ) {
        await tx.accountMeta.upsert({
          where: { accountId },
          update: {
            panNumber: data.panNumber,
            passportNumber: data.passportNumber,
            emiratiId: data.emiratiId,
            occupation: data.occupation ?? null,
            monthlyIncome: data.monthlyIncome ?? null,
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth)
              : undefined,
            licenseNumber: data.licenseNumber,
            licenseExpiry: data.licenseExpiry
              ? new Date(data.licenseExpiry)
              : undefined,
          },
          create: {
            accountId,
            panNumber: data.panNumber,
            passportNumber: data.passportNumber,
            emiratiId: data.emiratiId,
            occupation: data.occupation ?? null,
            monthlyIncome: data.monthlyIncome ?? null,
            licenseNumber: data.licenseExpiry,
            licenseExpiry: data.licenseExpiry
              ? new Date(data.licenseExpiry)
              : undefined,
            dateOfBirth: data.dateOfBirth
              ? new Date(data.dateOfBirth)
              : undefined,
          },
        });
      }

      if (data.residentialAddress) {
        const account = await tx.account.findUnique({
          where: { id: accountId },
          select: { currentAddressId: true },
        });

        if (account && account.currentAddressId) {
          await tx.address.update({
            where: { id: account.currentAddressId },
            data: data.residentialAddress,
          });
        } else {
          const address = await tx.address.create({
            data: data.residentialAddress,
          });

          await tx.account.update({
            where: { id: accountId },
            data: { currentAddressId: address.id },
          });
        }
      }

      if (data.documents?.length) {
        await this.uploadDocuments(tx, accountId, data.documents);
      }
      const kyc = await tx.kyc.upsert({
        where: { accountId },
        update: {
          status: 'Submitted',
          submittedAt: new Date(),
          verifier: this.resolveKycVerifier(type),
        },
        create: {
          accountId,
          status: 'Submitted',
          submittedAt: new Date(),
          verifier: this.resolveKycVerifier(type),
        },
      });

      return kyc;
    });

    try {
      await this.notificationService._sendNotification({
        code: AdminNotificationCode.KYC_SUBMITTED,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Informational,
        data: {
          userName: `${accountData?.firstname} ${accountData?.lastname}`,
        },
      });
    } catch (err) {
      console.error('Notification failed:', err);
    }

    await this.activityService.createLog({
      type: ActivityType.KYC_SUBMITTED,
      actorType: ACTOR_TYPE_MAP[type] ?? ActivityActorType.SYSTEM,
      actorId: accountId,
      entityType: ActivityEntityType.KYC,
      entityId: kyc.id,
      targetId: accountId,
      label: 'KYC details have been successfully submitted for verification.',
      metadata: {
        message:
          'KYC details have been successfully submitted for verification.',
      },
    });

    return { message: 'KYC details updated successfully' };
  }

  private resolveKycVerifier(type: AccountType | UserType): KycVerifier {
    if (type === UserType.Admin || type === UserType.User) {
      throw new Error(
        'UserType is not allowed for KYC verification resolution',
      );
    }
    return KycVerifier.Admin;
  }

  async uploadDocuments(
    tx: Prisma.TransactionClient,
    accountId: number,
    documents: KycDocumentUploadDto[],
  ) {
    const devNames = documents.map((d) => d.developerName);

    const docs = await tx.document.findMany({
      where: { developerName: { in: devNames } },
    });

    if (docs.length !== devNames.length) {
      throw new Error('Invalid document type');
    }

    const entity = await this.prisma.entityDocument.findFirst({
      where: { accountId },
    });

    if (entity) {
      await tx.entityDocument.deleteMany({
        where: { accountId },
      });
    }

    const entityDocuments = documents.map((item) => {
      const doc = docs.find((d) => d.developerName === item.developerName)!;

      return {
        accountId,
        documentTypeId: doc.id,
        url: item.filename,
        uploadedAt: new Date(),
        isVerified: false,
      };
    });

    await tx.entityDocument.createMany({
      data: entityDocuments,
    });
  }
}
