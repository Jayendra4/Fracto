import { Injectable } from '@nestjs/common';
import { toCsv } from '@Common';
import { PrismaService } from '../prisma';
import {
  AccountType,
  AssetStatus,
  CommissionStatus,
  PayoutStatus,
  Prisma,
} from '../generated/prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlatformActivityReport(): Promise<string> {
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const logs = await this.prisma.activityLog.findMany({
      where: { createdAt: { gte: fromDate } },
      orderBy: { createdAt: 'desc' },
    });

    return toCsv(logs, [
      { key: 'id', header: 'Activity ID' },
      { key: 'type', header: 'Activity Type' },
      { key: 'actorType', header: 'Actor Type' },
      { key: 'actorId', header: 'Actor ID' },
      { key: 'entityType', header: 'Entity Type' },
      { key: 'entityId', header: 'Entity ID' },
      { key: 'label', header: 'Label' },
      { key: 'targetId', header: 'Target ID' },
      {
        key: 'metadata',
        header: 'Metadata',
        format: (row) => (row.metadata ? JSON.stringify(row.metadata) : ''),
      },
      { key: 'createdAt', header: 'Created At' },
    ]);
  }

  async getKycStatusReport(): Promise<string> {
    const accounts = await this.prisma.account.findMany({
      where: { isDeleted: false },
      include: { kyc: true, companyKyc: true },
      orderBy: { createdAt: 'desc' },
    });

    const rows = accounts.map((account) => ({
      accountId: account.id,
      firstname: account.firstname,
      lastname: account.lastname,
      email: account.email,
      mobile: account.mobile,
      accountType: account.type,
      accountStatus: account.status,
      kycStatus:
        account.kyc?.status ??
        account.companyKyc?.overallStatus ??
        'Not Started',
      kycVerifier: account.kyc?.verifier ?? '',
      submittedAt:
        account.kyc?.submittedAt ?? account.companyKyc?.kybSubmittedAt ?? null,
      reviewedAt:
        account.kyc?.reviewedAt ?? account.companyKyc?.kybReviewedAt ?? null,
      rejectionReason:
        account.kyc?.rejectionReason ?? account.companyKyc?.remarks ?? '',
      createdAt: account.createdAt,
    }));

    return toCsv(rows, [
      { key: 'accountId', header: 'Account ID' },
      { key: 'firstname', header: 'First Name' },
      { key: 'lastname', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'mobile', header: 'Mobile' },
      { key: 'accountType', header: 'Account Type' },
      { key: 'accountStatus', header: 'Account Status' },
      { key: 'kycStatus', header: 'KYC Status' },
      { key: 'kycVerifier', header: 'KYC Verifier' },
      { key: 'submittedAt', header: 'Submitted At' },
      { key: 'reviewedAt', header: 'Reviewed At' },
      { key: 'rejectionReason', header: 'Rejection Reason' },
      { key: 'createdAt', header: 'Account Created At' },
    ]);
  }

  async buildAssetsCsv(where: Prisma.AssetWhereInput): Promise<string> {
    const assets = await this.prisma.asset.findMany({
      where,
      include: {
        price: true,
        account: { select: { firstname: true, lastname: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = assets.map((asset) => ({
      ...asset,
      ownerName: asset.account
        ? `${asset.account.firstname} ${asset.account.lastname}`.trim()
        : '',
      ownerEmail: asset.account?.email ?? '',
      initialPricePerFraction: asset.price?.initialPricePerFraction ?? '',
      currentPricePerFraction: asset.price?.currentPricePerFraction ?? '',
    }));

    return toCsv(rows, [
      { key: 'id', header: 'Asset ID' },
      { key: 'assetTitle', header: 'Asset Title' },
      { key: 'assetType', header: 'Asset Type' },
      { key: 'assetSubType', header: 'Asset Sub Type' },
      { key: 'ownershipModel', header: 'Ownership Model' },
      { key: 'status', header: 'Asset Status' },
      { key: 'totalFractions', header: 'Total Fractions' },
      { key: 'soldFractions', header: 'Sold Fractions' },
      { key: 'remainingFractions', header: 'Remaining Fractions' },
      { key: 'yieldPercentage', header: 'Yield %' },
      { key: 'initialPricePerFraction', header: 'Initial Price / Fraction' },
      { key: 'currentPricePerFraction', header: 'Current Price / Fraction' },
      { key: 'isVisible', header: 'Is Visible' },
      { key: 'isVerified', header: 'Is Verified' },
      { key: 'ownerName', header: 'Owner Name' },
      { key: 'ownerEmail', header: 'Owner Email' },
      { key: 'createdAt', header: 'Created At' },
      { key: 'updatedAt', header: 'Updated At' },
    ]);
  }

  async getAssetPipelineReport(): Promise<string> {
    return this.buildAssetsCsv({});
  }

  async getFundingPipelineReport(): Promise<string> {
    return this.buildAssetsCsv({ status: AssetStatus.Funded });
  }

  async getBrokerPerformanceReport(): Promise<string> {
    const brokers = await this.prisma.account.findMany({
      where: { type: AccountType.Broker, isDeleted: false },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        mobile: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const brokerIds = brokers.map((broker) => broker.id);

    if (brokerIds.length === 0) {
      return toCsv([], this.brokerPerformanceColumns());
    }

    const [
      referralsGrouped,
      earnedGrouped,
      pendingGrouped,
      paidOutGrouped,
      contractsGrouped,
      campaigns,
    ] = await Promise.all([
      this.prisma.assetOwnerInvite.groupBy({
        by: ['brokerId'],
        where: { brokerId: { in: brokerIds } },
        _count: { _all: true },
      }),
      this.prisma.referralCommission.groupBy({
        by: ['ownerId'],
        where: {
          ownerId: { in: brokerIds },
          status: { in: [CommissionStatus.Confirmed, CommissionStatus.Paid] },
        },
        _sum: { commissionAmount: true },
      }),
      this.prisma.referralCommission.groupBy({
        by: ['ownerId'],
        where: { ownerId: { in: brokerIds }, status: CommissionStatus.Pending },
        _sum: { commissionAmount: true },
      }),
      this.prisma.commissionPayoutRequest.groupBy({
        by: ['brokerId'],
        where: { brokerId: { in: brokerIds }, status: PayoutStatus.Paid },
        _sum: { amount: true },
      }),
      this.prisma.assetBrokerCommissionContract.groupBy({
        by: ['brokerId'],
        where: { brokerId: { in: brokerIds } },
        _count: { _all: true },
      }),
      this.prisma.referralCampaign.findMany({
        where: { ownerId: { in: brokerIds } },
        select: { ownerId: true, _count: { select: { usages: true } } },
      }),
    ]);

    const referralsMap = new Map(
      referralsGrouped.map((row) => [row.brokerId, row._count._all]),
    );
    const earnedMap = new Map(
      earnedGrouped.map((row) => [row.ownerId, row._sum.commissionAmount]),
    );
    const pendingMap = new Map(
      pendingGrouped.map((row) => [row.ownerId, row._sum.commissionAmount]),
    );
    const paidOutMap = new Map(
      paidOutGrouped.map((row) => [row.brokerId, row._sum.amount]),
    );
    const contractsMap = new Map(
      contractsGrouped.map((row) => [row.brokerId, row._count._all]),
    );
    const leadsGeneratedMap = new Map<number, number>();
    for (const campaign of campaigns) {
      leadsGeneratedMap.set(
        campaign.ownerId,
        (leadsGeneratedMap.get(campaign.ownerId) ?? 0) + campaign._count.usages,
      );
    }

    const rows = brokers.map((broker) => ({
      brokerId: broker.id,
      brokerName: `${broker.firstname} ${broker.lastname}`.trim(),
      email: broker.email,
      mobile: broker.mobile,
      status: broker.status,
      totalAssetReferrals: referralsMap.get(broker.id) ?? 0,
      totalLeadsGenerated: leadsGeneratedMap.get(broker.id) ?? 0,
      assetsUnderContract: contractsMap.get(broker.id) ?? 0,
      totalCommissionEarned: earnedMap.get(broker.id) ?? 0,
      pendingCommission: pendingMap.get(broker.id) ?? 0,
      totalCommissionPaidOut: paidOutMap.get(broker.id) ?? 0,
      joinedAt: broker.createdAt,
    }));

    return toCsv(rows, this.brokerPerformanceColumns());
  }

  private brokerPerformanceColumns() {
    return [
      { key: 'brokerId', header: 'Broker ID' },
      { key: 'brokerName', header: 'Broker Name' },
      { key: 'email', header: 'Email' },
      { key: 'mobile', header: 'Mobile' },
      { key: 'status', header: 'Account Status' },
      { key: 'totalAssetReferrals', header: 'Total Asset Referrals' },
      { key: 'totalLeadsGenerated', header: 'Total Leads Generated' },
      { key: 'assetsUnderContract', header: 'Assets Under Contract' },
      { key: 'totalCommissionEarned', header: 'Total Commission Earned' },
      { key: 'pendingCommission', header: 'Pending Commission' },
      { key: 'totalCommissionPaidOut', header: 'Total Commission Paid Out' },
      { key: 'joinedAt', header: 'Joined At' },
    ];
  }
}
