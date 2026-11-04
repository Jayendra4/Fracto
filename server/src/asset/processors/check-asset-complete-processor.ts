// import { Job } from 'bullmq';
// import { Inject } from '@nestjs/common';
// import { Processor } from '@nestjs/bullmq';
// import { ConfigType } from '@nestjs/config';
// import { BaseProcessor, NotificationAudience, NotificationCode } from '@Common';
// import { assetCheckQueueConfigFactory } from '@Config';
// import { PrismaService } from '../../prisma';
// import { NotificationService } from '../../notification';
// import {
//   AccountType,
//   NewAssetStatus,
//   newRWAStatus,
//   NotificationType,
// } from '../../generated/prisma/enums';
// import {
//   REQUIRED_DOCUMENT_TYPES,
//   REQUIRED_META_KEYS,
// } from './asset-complete.config';
// import { ASSET_CHECK_QUEUE } from './asset-check.constants';

// type AssetCheckPayload = Record<string, never>;

// @Processor(ASSET_CHECK_QUEUE)
// export class CheckAssetCompleteProcessor extends BaseProcessor {
//   constructor(
//     @Inject(assetCheckQueueConfigFactory.KEY)
//     readonly config: ConfigType<typeof assetCheckQueueConfigFactory>,
//     private readonly prisma: PrismaService,
//     private readonly notificationService: NotificationService,
//   ) {
//     super(config.concurrency, {
//       loggerDefaultMeta: { processor: CheckAssetCompleteProcessor.name },
//     });
//   }

//   async process(job: Job<AssetCheckPayload>): Promise<void> {
//     this.logger.info(`Running asset check job ${job.id}`);

//     const [approvedAssets, trustees] = await Promise.all([
//       this.prisma.asset.findMany({
//         where: {
//           newStatus: NewAssetStatus.RequestAccepted,
//           updateAsset: true,
//           OR: [
//             { lastNotifiedAt: null },
//             { lastNotifiedAt: { lte: new Date(Date.now() - 2 * 60 * 1000) } },
//           ],
//         },
//         select: {
//           id: true,
//           accountId: true,
//           assetTitle: true,
//           assetType: true,
//           currentOwnerName: true,
//           ownershipModel: true,
//           assetOwner: { select: { name: true, email: true, mobile: true } },
//           meta: { select: { metaKey: true, metaValue: true, metaType: true } },
//           propertyInterest: {
//             select: { title: true, description: true, icon: true },
//           },
//           documents: {
//             select: {
//               documentType: true,
//               documentName: true,
//               documentUrl: true,
//             },
//           },
//         },
//       }),
//       this.prisma.account.findMany({
//         where: { type: AccountType.Trustee },
//         select: { id: true },
//       }),
//     ]);

//     this.logger.info(`Found ${approvedAssets.length} assets to check`);

//     if (!approvedAssets.length) return;

//     const trusteeIds = trustees.map((t) => t.id);
//     const completeAssetIds: number[] = [];
//     const incompleteAssets: {
//       id: number;
//       accountId: number;
//       missingFields: string[];
//     }[] = [];

//     for (const asset of approvedAssets) {
//       const { isComplete, missingFields } = this.checkAssetComplete(asset);
//       if (isComplete) {
//         completeAssetIds.push(asset.id);
//       } else if (asset.accountId) {
//         incompleteAssets.push({
//           id: asset.id,
//           accountId: asset.accountId,
//           missingFields,
//         });
//       }
//     }

//     if (completeAssetIds.length > 0) {
//       await Promise.all([
//         this.prisma.asset.updateMany({
//           where: { id: { in: completeAssetIds } },
//           data: { newStatus: NewAssetStatus.ReviewPending },
//         }),
//         this.prisma.rWARequest.updateMany({
//           where: { assetId: { in: completeAssetIds } },
//           data: { newRwaStatus: newRWAStatus.ReviewPending },
//         }),
//       ]);

//       this.logger.info(
//         `${completeAssetIds.length} assets updated to ReviewPending`,
//       );

//       if (trusteeIds.length > 0) {
//         await this.notificationService._sendNotification({
//           code: NotificationCode.TRUSTEE_ASSET_REVIEWED,
//           audience: NotificationAudience.BOTH,
//           type: NotificationType.Informational,
//           userIds: trusteeIds,
//           data: {
//             AssetName: `${completeAssetIds.length} assets ready for review`,
//           },
//         });
//       }
//     }

//     if (incompleteAssets.length > 0) {
//       await this.prisma.asset.updateMany({
//         where: { id: { in: incompleteAssets.map((a) => a.id) } },
//         data: { lastNotifiedAt: new Date() },
//       });

//       await Promise.all(
//         incompleteAssets.map((asset) =>
//           this.notificationService
//             ._sendNotification({
//               code: NotificationCode.MISSING_FIELDS,
//               audience: NotificationAudience.USER,
//               type: NotificationType.Informational,
//               userIds: [asset.accountId],
//               data: { fieldName: asset.missingFields.join(', ') },
//             })
//             .catch((err) =>
//               this.logger.error(
//                 `Notification failed for asset ${asset.id}`,
//                 err,
//               ),
//             ),
//         ),
//       );

//       this.logger.info(
//         `${incompleteAssets.length} assets incomplete — notifications sent`,
//       );
//     }
//   }

//   private checkAssetComplete(asset: {
//     id: number;
//     accountId: number | null;
//     assetTitle: string;
//     assetType: string;
//     currentOwnerName: string;
//     ownershipModel: string;
//     assetOwner: {
//       name: string | null;
//       email: string | null;
//       mobile: string | null;
//     } | null;
//     meta: {
//       metaKey: string;
//       metaValue: string | null;
//       metaType: string | null;
//     }[];
//     propertyInterest: { title: string; description: string; icon: string }[];
//     documents: {
//       documentType: string;
//       documentName: string | null;
//       documentUrl: string;
//     }[];
//   }): { isComplete: boolean; missingFields: string[] } {
//     const missingFields: string[] = [];

//     if (!asset.assetTitle?.trim()) missingFields.push('Asset Title');
//     if (!asset.currentOwnerName?.trim())
//       missingFields.push('Current Owner Name');
//     if (!asset.ownershipModel?.trim()) missingFields.push('Ownership Model');

//     if (
//       !asset.assetOwner?.name ||
//       !asset.assetOwner?.email ||
//       !asset.assetOwner?.mobile
//     ) {
//       missingFields.push('Owner Details (name, email, mobile)');
//     }

//     const metaMap = new Map(asset.meta.map((m) => [m.metaKey, m.metaValue]));
//     for (const key of REQUIRED_META_KEYS) {
//       const value = metaMap.get(key);
//       if (!value || value.trim() === '') missingFields.push(key);
//     }

//     const docTypes = new Set(asset.documents.map((d) => d.documentType));
//     for (const docType of REQUIRED_DOCUMENT_TYPES) {
//       if (!docTypes.has(docType)) missingFields.push(`Document: ${docType}`);
//     }

//     if (!asset.propertyInterest?.length) {
//       missingFields.push('Why Invest (Property Interest)');
//     } else {
//       const hasInvalid = asset.propertyInterest.some(
//         (p) => !p.title?.trim() || !p.description?.trim() || !p.icon?.trim(),
//       );
//       if (hasInvalid) missingFields.push('Incomplete Property Interest Entry');
//     }

//     return { isComplete: missingFields.length === 0, missingFields };
//   }
// }
