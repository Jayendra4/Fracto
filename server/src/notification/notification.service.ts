import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { FirebaseService } from '../common/providers/firebase.service';
import {
  AllNotificationPaths,
  AllNotificationTemplates,
  AnyNotificationCode,
  NotificationAudience,
  NotificationCode,
  NotificationPaths,
  NotificationTemplates,
  NotificationViewerPathOverrides,
  UserType,
} from '@Common';
import {
  AccountType,
  NotificationType,
  TargetType,
} from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) { }

  private interpolate(text: string, data?: Record<string, any>): string {
    if (!data) return text;

    return text.replace(/{{(.*?)}}/g, (_, key) => {
      const value = data[key.trim()];
      return value !== undefined ? String(value) : '';
    });
  }

  // Resolves the click-to-navigate path for a notification code. Returns
  // null if the code has no path template, or if the template references a
  // placeholder that's missing from `data` — a partially-resolved path
  // (e.g. "/assets/") is worse than none, since the frontend can't tell it
  // apart from a valid empty segment.
  private resolvePath(
    code: AnyNotificationCode,
    pathMap: Record<string, string | null | undefined>,
    data?: Record<string, any>,
  ): string | null {
    const template = pathMap[code];
    if (!template) return null;

    const placeholders = [...template.matchAll(/{{(.*?)}}/g)].map((m) =>
      m[1].trim(),
    );
    const hasAllValues = placeholders.every(
      (key) => data?.[key] !== undefined && data[key] !== null,
    );
    if (!hasAllValues) return null;

    return this.interpolate(template, data);
  }

  private buildFcmPayload(notification: {
    id: number;
    title: string;
    body: string;
  }) {
    return {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: {
        title: notification.title,
        body: notification.body,
        notificationId: String(notification.id),
      },
      android: {
        priority: 'high',
      },
    };
  }

  async sendNotification(params: {
    code: NotificationCode;
    targetType: TargetType;
    userIds?: number[];
    data?: Record<string, any>;
    type?: NotificationType;
    createdById?: number;
  }) {
    if (
      params.targetType === TargetType.Single &&
      (!params.userIds || params.userIds.length !== 1)
    ) {
      throw new Error('TargetType.Single requires exactly one userId');
    }

    const template = NotificationTemplates[params.code];
    if (!template) {
      throw new Error(`Template not found for ${params.code}`);
    }

    const title = this.interpolate(template.title, params.data);
    const body = this.interpolate(template.message, params.data);
    const path = this.resolvePath(params.code, NotificationPaths, params.data);
    const notification = await this.prisma.notification.create({
      data: {
        notificationCode: params.code.toString(),
        title,
        body,
        data: params.data,
        path,
        type: params.type ?? NotificationType.Informational,
        sendAt: new Date(),
        targetType: params.targetType,
        createdById: params.createdById,
      },
    });

    let tokens: string[] = [];
    let targetUserIds: number[] = [];
    if (params.targetType === TargetType.Single) {
      const userIds = params.userIds;
      if (!userIds || !userIds.length) {
        throw new Error('TargetType.Single requires at least one userId');
      }
      const devices = await this.prisma.userDeviceToken.findMany({
        where: {
          userId: { in: userIds },
          isActive: true,
        },
        select: {
          token: true,
          userId: true,
        },
      });
      tokens = devices.map((d) => d.token);
      targetUserIds = [...new Set(devices.map((d) => d.userId))];
      if (!tokens.length) {
        return;
      }
    }

    if (params.targetType === TargetType.All) {
      const devices = await this.prisma.userDeviceToken.findMany({
        where: { isActive: true },
        select: {
          token: true,
          userId: true,
        },
      });
      tokens = devices.map((d) => d.token);
      targetUserIds = [...new Set(devices.map((d) => d.userId))];
    }
    if (targetUserIds.length) {
      await this.prisma.notificationViews.createMany({
        data: targetUserIds.map((userId) => ({
          userId,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });
    }

    if (tokens.length) {
      const payload = this.buildFcmPayload(notification);
      try {
        await this.firebaseService.sendToDeviceTokens(tokens, payload);
      } catch (err) {
        console.error('FCM error:', err);
      }
    }

    return notification;
  }

  async _sendNotification(params: {
    code: AnyNotificationCode;
    audience: NotificationAudience;
    targetType?: TargetType;
    userIds?: number[];
    data?: Record<string, any>;
    type?: NotificationType;
    groupId?: number;
    createdById?: number;
  }) {
    const template = AllNotificationTemplates[params.code];
    if (!template) {
      throw new Error(`Template not found for ${params.code}`);
    }
    console.log('data', template);

    const title = this.interpolate(template.title, params.data);
    const body = this.interpolate(template.message, params.data);
    const path = this.resolvePath(
      params.code,
      AllNotificationPaths,
      params.data,
    );

    const notification = await this.prisma.notification.create({
      data: {
        notificationCode: params.code.toString(),
        title,
        body,
        data: params.data,
        path,
        type: params.type ?? NotificationType.Informational,
        sendAt: new Date(),
        targetType: params.targetType,
        createdById: params.createdById,
      },
    });

    // Who should see this in-app is a question of audience membership, not
    // of who happens to have a push token registered — a recipient with no
    // device token (e.g. an admin who only ever uses the web panel) must
    // still get a NotificationViews row, or the notification silently never
    // appears in their "my notifications" list even though it was "sent".
    let targetUserIds: number[] = [];

    // SINGLE USER
    if (params.audience === NotificationAudience.USER) {
      if (!params.userIds?.length) {
        return;
      }

      targetUserIds = [...new Set(params.userIds)];
    }

    // ALL USERS
    if (params.targetType === TargetType.All) {
      const accounts = await this.prisma.account.findMany({
        select: { id: true },
      });
      targetUserIds = accounts.map((a) => a.id);
    }

    // ADMINS ONLY
    if (params.audience === NotificationAudience.ADMIN) {
      const admins = await this.prisma.admin.findMany({
        where: {
          id: 1,
        },
        select: { id: true },
      });

      targetUserIds = admins.map((a) => a.id);
    }

    // BOTH (User + Admin)
    if (params.audience === NotificationAudience.BOTH) {
      const admins = await this.prisma.admin.findMany({
        where: {
          id: 1,
        },
        select: { id: true },
      });

      targetUserIds = [
        ...new Set([...(params.userIds ?? []), ...admins.map((a) => a.id)]),
      ];
    }

    if (targetUserIds.length) {
      await this.prisma.notificationViews.createMany({
        data: targetUserIds.map((userId) => ({
          userId,
          notificationId: notification.id,
        })),
        skipDuplicates: true,
      });
    }

    // Push (FCM) is best-effort on top of the above — only recipients who
    // also have an active device token get a push, but everyone in
    // targetUserIds already has their in-app notification recorded
    // regardless of this.
    const tokens = targetUserIds.length
      ? (
        await this.prisma.userDeviceToken.findMany({
          where: { isActive: true, userId: { in: targetUserIds } },
          select: { token: true },
        })
      ).map((d) => d.token)
      : [];

    if (tokens.length) {
      try {
        await this.firebaseService.sendToDeviceTokens(
          tokens,
          this.buildFcmPayload(notification),
        );
      } catch (e) {
        console.error('FCM error', e);
      }
    }

    return notification;
  }

  async markAsRead(userId: number, notificationId: number) {
    return this.prisma.notificationViews.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      data: {
        viewed: true,
        readAt: new Date(),
      },
    });
  }

  async getAllNotifications(options?: {
    search?: string;
    skip?: number;
    take?: number;
    fromDate?: string;
    toDate?: string;
  }) {
    const search = options?.search?.trim();
    const pagination = {
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
    };

    const where: Prisma.NotificationWhereInput = {};

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
        term: string,
      ): Prisma.NotificationWhereInput[] => [
          { title: { contains: term, mode: 'insensitive' } },
          { body: { contains: term, mode: 'insensitive' } },
        ];

      const parts = search.split(' ').filter((p) => p.trim() !== '');

      if (parts.length > 0) {
        where.AND = parts.map((part) => ({
          OR: buildSearchFilter(part.trim()),
        }));
      }
    }

    const count = await this.prisma.notification.count({
      where: {
        ...where,
      },
    });

    const notifications = await this.prisma.notification.findMany({
      where: {
        ...where,
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count,
      skip: pagination.skip,
      take: pagination.take,
      data: notifications,
    };
  }

  private resolveViewerPath(
    code: string | null,
    storedPath: string | null,
    data: Prisma.JsonValue,
    accountType?: AccountType | UserType,
  ): string | null {
    if (!accountType || !code) return storedPath;

    const overridesByRole = NotificationViewerPathOverrides as Record<
      string,
      Partial<Record<AccountType | UserType, string | null>> | undefined
    >;
    const override = overridesByRole[code]?.[accountType];
    if (override === undefined) return storedPath;
    if (override === null) return null;

    return this.interpolate(override, data as Record<string, any> | undefined);
  }

  async getNotifications(
    accountId: number,
    options?: {
      search?: string;
      skip?: number;
      take?: number;
      fromDate?: string;
      toDate?: string;
    },
    accountType?: AccountType | UserType,
  ) {
    const search = options?.search?.trim();
    const pagination = {
      skip: options?.skip ?? 0,
      take: options?.take ?? 10,
    };

    const where: Prisma.NotificationViewsWhereInput = {
      userId: accountId,
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

    if (search?.trim()) {
      const terms = search.trim().split(/\s+/);

      where.AND = terms.map((term) => ({
        notification: {
          OR: [
            { title: { contains: term, mode: 'insensitive' } },
            { body: { contains: term, mode: 'insensitive' } },
          ],
        },
      }));
    }

    const count = await this.prisma.notificationViews.count({
      where: {
        ...where,
      },
    });

    const notifications = await this.prisma.notificationViews.findMany({
      where: {
        ...where,
      },
      include: {
        notification: {
          select: {
            id: true,
            notificationCode: true,
            title: true,
            body: true,
            data: true,
            path: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: pagination.skip,
      take: pagination.take,
    });

    return {
      count,
      skip: pagination.skip,
      take: pagination.take,
      data: notifications.map((n) => ({
        id: n.notification.id,
        code: n.notification.notificationCode,
        title: n.notification.title,
        body: n.notification.body,
        data: n.notification.data,
        path: this.resolveViewerPath(
          n.notification.notificationCode,
          n.notification.path,
          n.notification.data,
          accountType,
        ),
        type: n.notification.type,
        viewed: n.viewed,
        readAt: n.readAt,
        createdAt: n.notification.createdAt,
      })),
    };
  }

  async markAsAllRead(userId: number, notificationId: number) {
    return this.prisma.notificationViews.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
      data: {
        viewed: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: number) {
    return this.prisma.notificationViews.updateMany({
      where: {
        userId,
        viewed: false,
      },
      data: {
        viewed: true,
        readAt: new Date(),
      },
    });
  }
}
