import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UploadDocumentDto } from './dto';
import { KycStatus, NotificationType } from '../generated/prisma/enums';
import { NotificationService } from '../notification';
import { AdminNotificationCode, NotificationAudience } from '@Common';

@Injectable()
export class DirectorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async upsertDirector(companyId: number, data: CreateDirectorDto) {
    return this.prisma.$transaction(async (tx) => {
      const company = await tx.company.findUnique({
        where: { id: companyId },
        select: { id: true },
      });

      if (!company) {
        throw new Error('Company not found');
      }
      const existingDirector = await tx.director.findFirst({
        where: {
          companyId,
          email: data.email,
        },
        include: {
          permanentAddress: true,
          directorMeta: true,
        },
      });

      if (existingDirector) {
        let addressId = existingDirector.permanentAddressId;

        if (existingDirector.permanentAddressId) {
          await tx.address.update({
            where: { id: existingDirector.permanentAddressId },
            data: {
              addressLine1: data.address.line1,
              addressLine2: data.address.line2,
              city: data.address.city,
              state: data.address.state,
              pincode: data.address.pincode,
            },
          });
        } else {
          const address = await tx.address.create({
            data: {
              addressLine1: data.address.line1,
              addressLine2: data.address.line2,
              city: data.address.city,
              state: data.address.state,
              pincode: data.address.pincode,
            },
          });

          addressId = address.id;
        }

        const director = await tx.director.update({
          where: { id: existingDirector.id },
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            roleInCompany: data.roleInCompany,
            dateOfBirth: new Date(data.dateOfBirth),
            nationality: data.nationality,
            mobileNumber: data.mobileNumber,
            permanentAddressId: addressId,
          },
          include: {
            permanentAddress: true,
            documents: true,
            directorMeta: true,
          },
        });

        const directorMeta = await tx.directorMeta.upsert({
          where: { directorId: director.id },
          update: {
            panNumber: data.panNumber,
            emiratesIdNumber: data.emiratesIdNumber,
            passportNumber: data.passportNumber,
          },
          create: {
            directorId: director.id,
            panNumber: data.panNumber,
            emiratesIdNumber: data.emiratesIdNumber,
            passportNumber: data.passportNumber,
          },
        });

        return {
          message: 'Director updated successfully',
          director: {
            ...director,
            directorMeta,
          },
        };
      }

      const address = await tx.address.create({
        data: {
          addressLine1: data.address.line1,
          addressLine2: data.address.line2,
          city: data.address.city,
          state: data.address.state,
          pincode: data.address.pincode,
        },
      });

      const director = await tx.director.create({
        data: {
          companyId,
          firstName: data.firstName,
          lastName: data.lastName,
          roleInCompany: data.roleInCompany,
          dateOfBirth: new Date(data.dateOfBirth),
          nationality: data.nationality,
          email: data.email,
          mobileNumber: data.mobileNumber,
          permanentAddressId: address.id,
        },
        include: {
          permanentAddress: true,
          documents: true,
          directorMeta: true,
        },
      });

      const directorMeta = await tx.directorMeta.create({
        data: {
          directorId: director.id,
          panNumber: data.panNumber,
          emiratesIdNumber: data.emiratesIdNumber,
          passportNumber: data.passportNumber,
        },
      });

      return {
        message: 'Director created and KYC/AML process started',
        director: {
          ...director,
          directorMeta,
        },
      };
    });
  }

  async uploadDocuments(
    accountId: number,
    directorId: number,
    documents: UploadDocumentDto[],
  ) {
    if (!documents.length) return [];

    const documentCodes = documents.map((d) => d.documentTypeCode);
    const directorName = await this.prisma.director.findUnique({
      where: { id: directorId },
      select: { firstName: true, lastName: true },
    });

    const entityDocumentsData = this.prisma.$transaction(async (tx) => {
      const documentTypes = await tx.document.findMany({
        where: {
          developerName: { in: documentCodes },
        },
      });

      const docTypeMap = new Map(
        documentTypes.map((d) => [d.developerName, d.id]),
      );

      for (const code of documentCodes) {
        if (!docTypeMap.has(code)) {
          throw new Error(`Invalid document type: ${code}`);
        }
      }

      const entityDocuments = documents.map((dto) => ({
        directorId,
        documentTypeId: docTypeMap.get(dto.documentTypeCode)!,
        url: dto.documentUrl,
        documentIdentifier: dto.documentIdentifier,
        uploadedAt: new Date(),
      }));

      await tx.entityDocument.createMany({
        data: entityDocuments,
      });

      await tx.companyKyc.upsert({
        where: { accountId },
        create: {
          accountId,
          kycStatus: KycStatus.Submitted,
          overallStatus: KycStatus.Submitted,
          kycSubmittedAt: new Date(),
        },
        update: {
          kycStatus: KycStatus.Submitted,
          overallStatus: KycStatus.Submitted,
          kycSubmittedAt: new Date(),
        },
      });
    });

    try {
      await this.notificationService._sendNotification({
        code: AdminNotificationCode.DIRECTOR_KYC_SUBMITTED,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Informational,
        data: {
          userName: `${directorName?.firstName} ${directorName?.lastName}`,
        },
      });
    } catch (error) {
      console.error('Failed to send notification in director KYB', error);
    }

    return entityDocumentsData;
  }

  async uploadUpdateDocuments(
    accountId: number,
    directorId: number,
    documents: UploadDocumentDto[],
  ) {
    if (!documents.length) return [];

    const documentCodes = documents.map((d) => d.documentTypeCode);
    const directorName = await this.prisma.director.findUnique({
      where: { id: directorId },
      select: { firstName: true, lastName: true },
    });

    const entityDocumentData = this.prisma.$transaction(async (tx) => {
      const documentTypes = await tx.document.findMany({
        where: {
          developerName: { in: documentCodes },
        },
      });

      const docTypeMap = new Map(
        documentTypes.map((d) => [d.developerName, d.id]),
      );

      for (const code of documentCodes) {
        if (!docTypeMap.has(code)) {
          throw new Error(`Invalid document type: ${code}`);
        }
      }
      const entity = await tx.entityDocument.findFirst({
        where: { directorId },
      });

      if (entity) {
        await tx.entityDocument.deleteMany({
          where: { directorId },
        });
      }

      const entityDocuments = documents.map((dto) => ({
        directorId,
        documentTypeId: docTypeMap.get(dto.documentTypeCode)!,
        url: dto.documentUrl,
        documentIdentifier: dto.documentIdentifier,
        uploadedAt: new Date(),
      }));

      await tx.entityDocument.createMany({
        data: entityDocuments,
      });

      await tx.companyKyc.upsert({
        where: { accountId },
        create: {
          accountId,
          kycStatus: KycStatus.Submitted,
          overallStatus: KycStatus.Submitted,
          kycSubmittedAt: new Date(),
        },
        update: {
          kycStatus: KycStatus.Submitted,
          overallStatus: KycStatus.Submitted,
          kycSubmittedAt: new Date(),
        },
      });
    });

    try {
      await this.notificationService._sendNotification({
        code: AdminNotificationCode.DIRECTOR_KYC_SUBMITTED,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Informational,
        data: {
          userName: `${directorName?.firstName} ${directorName?.lastName}`,
        },
      });
    } catch (error) {
      console.error(
        'Failed to send notification in director on Update KYB',
        error,
      );
    }

    return entityDocumentData;
  }
}
