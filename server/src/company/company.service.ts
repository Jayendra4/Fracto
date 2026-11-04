import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCompanyBasicDto,
  UpdateCompanyTaxDto,
  UploadDocumentDto,
} from './dto';
import {
  KycStatus,
  NotificationType,
  SourceOfFunds,
} from '../generated/prisma/client';
import {
  AdminNotificationCode,
  NotificationAudience,
  StorageService,
} from '@Common';
import { NotificationService } from '../notification';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
  ) {}

  private getProfileImageUrl(profileImage: string): string {
    return this.storageService.getFileUrl(profileImage, 'user/profile');
  }
  private async ensureCompanyExists(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) throw new Error('Company not found');
    return company;
  }

  private async ensureCompanyNotExistsForAccount(accountId: number) {
    const existing = await this.prisma.company.findFirst({
      where: { accountId },
    });
    if (existing) {
      throw new Error('Company is already registered for this user.');
    }
  }

  private async checkCinUnique(cin: string) {
    if (!cin) return;
    const found = await this.prisma.company.findFirst({
      where: { cinOrTradeLicenseNo: cin },
    });
    if (found) {
      throw new Error('CIN / Trade License is already in use');
    }
  }

  private async checkEmailUnique(email: string) {
    if (!email) return;
    const found = await this.prisma.company.findFirst({
      where: { companyEmail: email },
    });
    if (found) throw new Error('Company Email already exists');
  }

  private async checkPhoneUnique(phone: string) {
    if (!phone) return;
    const found = await this.prisma.company.findFirst({
      where: { companyPhone: phone },
    });
    if (found) throw new Error('Company Phone already exists');
  }

  private async checkPanUnique(pan: string, companyId: number) {
    if (!pan) return;
    const found = await this.prisma.companyMeta.findFirst({
      where: { panNumber: pan, companyId: { not: companyId } },
    });
    if (found) throw new Error('PAN already used by another company');
  }

  private async checkGstUnique(gst: string, companyId: number) {
    if (!gst) return;
    const found = await this.prisma.companyMeta.findFirst({
      where: { gstNumber: gst, companyId: { not: companyId } },
    });
    if (found) throw new Error('GST already used by another company');
  }

  async getCompanyByAccountId(accountId: number) {
    const company = await this.prisma.company.findFirst({
      where: { accountId },
      include: {
        meta: true,
        documents: true,
        registeredAddress: true,
        operationalAddress: true,
        directors: {
          include: {
            currentAddress: true,
            permanentAddress: true,
            directorMeta: true,
            documents: true,
          },
        },
      },
    });

    if (!company) {
      return [];
    }
    if (company.documents) {
      company.documents.forEach((d) => {
        if (d.url) {
          d.url = this.getProfileImageUrl(d.url);
        }
      });
    }
    return company;
  }

  private async validateUniqueFields(
    data: CreateCompanyBasicDto,
    excludeCompanyId?: number,
  ) {
    const conditions: any[] = [];

    if (data.cinOrTradeLicenseNo)
      conditions.push({ cinOrTradeLicenseNo: data.cinOrTradeLicenseNo });
    if (data.companyEmail) conditions.push({ companyEmail: data.companyEmail });
    if (data.companyPhone) conditions.push({ companyPhone: data.companyPhone });
    if (!conditions.length) return;

    const found = await this.prisma.company.findFirst({
      where: {
        OR: conditions,
        NOT: excludeCompanyId ? { id: excludeCompanyId } : undefined,
      },
    });

    if (found) {
      if (found.cinOrTradeLicenseNo === data.cinOrTradeLicenseNo)
        throw new Error('CIN already exists');

      if (found.companyEmail === data.companyEmail)
        throw new Error('Email already exists');

      if (found.companyPhone === data.companyPhone)
        throw new Error('Phone already exists');
    }
  }

  async upsertCompanyFirstStep(accountId: number, data: CreateCompanyBasicDto) {
    return this.prisma.$transaction(async (tx) => {
      const existingCompany = await tx.company.findFirst({
        where: { accountId },
      });

      if (existingCompany && existingCompany.registeredAddressId) {
        await this.validateUniqueFields(data, existingCompany.id);

        await tx.address.update({
          where: { id: existingCompany.registeredAddressId },
          data: {
            addressLine1: data.registeredAddressLine1,
            addressLine2: data.registeredAddressLine2,
            city: data.registeredCity,
            state: data.registeredState,
            pincode: data.registeredPincode,
          },
        });
        let operationalAddressId = existingCompany.operationalAddressId;

        if (
          data.operationalAddressLine1 &&
          data.operationalCity &&
          data.operationalState &&
          data.operationalPincode
        ) {
          if (existingCompany.operationalAddressId) {
            await tx.address.update({
              where: { id: existingCompany.operationalAddressId },
              data: {
                addressLine1: data.operationalAddressLine1,
                addressLine2: data.operationalAddressLine2,
                city: data.operationalCity,
                state: data.operationalState,
                pincode: data.operationalPincode,
              },
            });
          } else {
            const newOperational = await tx.address.create({
              data: {
                addressLine1: data.operationalAddressLine1,
                addressLine2: data.operationalAddressLine2,
                city: data.operationalCity,
                state: data.operationalState,
                pincode: data.operationalPincode,
              },
            });

            operationalAddressId = newOperational.id;
          }
        }

        const updatedCompany = await tx.company.update({
          where: { id: existingCompany.id },
          data: {
            legalEntityName: data.legalEntityName,
            tradeName: data.tradeName,
            entityType: data.entityType,
            cinOrTradeLicenseNo: data.cinOrTradeLicenseNo,
            dateOfIncorporation: new Date(data.dateOfIncorporation),
            companyEmail: data.companyEmail,
            companyPhone: data.companyPhone,
            websiteUrl: data.websiteUrl,
            operationalAddressId,
          },
        });

        await tx.companyMeta.updateMany({
          where: { companyId: existingCompany.id },
          data: {
            industryType: data.industryType,
          },
        });

        return updatedCompany;
      }

      await this.validateUniqueFields(data);
      const registeredAddress = await tx.address.create({
        data: {
          addressLine1: data.registeredAddressLine1,
          addressLine2: data.registeredAddressLine2,
          city: data.registeredCity,
          state: data.registeredState,
          pincode: data.registeredPincode,
        },
      });

      const operationalAddress =
        data.operationalAddressLine1 &&
        data.operationalCity &&
        data.operationalState &&
        data.operationalPincode
          ? await tx.address.create({
              data: {
                addressLine1: data.operationalAddressLine1,
                addressLine2: data.operationalAddressLine2,
                city: data.operationalCity,
                state: data.operationalState,
                pincode: data.operationalPincode,
              },
            })
          : null;

      const company = await tx.company.create({
        data: {
          legalEntityName: data.legalEntityName,
          tradeName: data.tradeName,
          entityType: data.entityType,
          cinOrTradeLicenseNo: data.cinOrTradeLicenseNo,
          dateOfIncorporation: new Date(data.dateOfIncorporation),
          companyEmail: data.companyEmail,
          companyPhone: data.companyPhone,
          websiteUrl: data.websiteUrl,
          accountId,
          registeredAddressId: registeredAddress.id,
          operationalAddressId: operationalAddress?.id ?? null,
        },
      });

      await tx.companyMeta.create({
        data: {
          companyId: company.id,
          industryType: data.industryType,
        },
      });

      return company;
    });
  }

  async updateCompanyMeta(
    accountId: number,
    companyId: number,
    data: Partial<{
      industryType: string;
      natureOfBusiness: string;
      businessDescription: string;
      expectedMonthlyTransactionVolume: number;
      expectedSourceOfFunds: SourceOfFunds;
      countriesOfOperation: string[];
      isCompanyPubliclyListed: boolean;
    }>,
  ) {
    await this.ensureCompanyExists(companyId);

    return this.prisma.companyMeta.upsert({
      where: { companyId },
      create: {
        companyId,
        industryType: data.industryType,
        natureOfBusiness: data.natureOfBusiness,
        businessDescription: data.businessDescription,
        expectedMonthlyTransactionVolume: data.expectedMonthlyTransactionVolume,
        expectedSourceOfFunds: data.expectedSourceOfFunds,
        countriesOfOperation: data.countriesOfOperation ?? [],
        isCompanyPubliclyListed: data.isCompanyPubliclyListed ?? false,
      },
      update: {
        industryType: data.industryType,
        natureOfBusiness: data.natureOfBusiness,
        businessDescription: data.businessDescription,
        expectedMonthlyTransactionVolume: data.expectedMonthlyTransactionVolume,
        expectedSourceOfFunds: data.expectedSourceOfFunds,
        countriesOfOperation: data.countriesOfOperation ?? [],
        isCompanyPubliclyListed: data.isCompanyPubliclyListed ?? false,
      },
    });
  }

  async updateCompanyTax(
    accountId: number,
    companyId: number,
    data: UpdateCompanyTaxDto,
  ) {
    await this.ensureCompanyExists(companyId);
    if (data.panNumber) await this.checkPanUnique(data.panNumber, companyId);
    if (data.gstNumber) await this.checkGstUnique(data.gstNumber, companyId);
    return this.prisma.companyMeta.upsert({
      where: { companyId },
      create: {
        companyId,
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        tanNumber: data.tanNumber,
        tradeLicenseExpiryDate: data.tradeLicenseExpiryDate
          ? new Date(data.tradeLicenseExpiryDate)
          : null,
        placeOfBusinessProofType: data.placeOfBusinessProofType,
      },
      update: {
        panNumber: data.panNumber,
        gstNumber: data.gstNumber,
        tanNumber: data.tanNumber,
        tradeLicenseExpiryDate: data.tradeLicenseExpiryDate
          ? new Date(data.tradeLicenseExpiryDate)
          : null,
        placeOfBusinessProofType: data.placeOfBusinessProofType,
      },
    });
  }

  async uploadDocuments(
    accountId: number,
    companyId: number,
    documents: UploadDocumentDto[],
  ) {
    if (!documents.length) return [];

    await this.ensureCompanyExists(companyId);

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, firstname: true, lastname: true, type: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const documentCodes = documents.map((d) => d.documentTypeCode);

    const uploadDocumentData = this.prisma.$transaction(async (tx) => {
      const documentTypes = await tx.document.findMany({
        where: { developerName: { in: documentCodes } },
      });

      const docTypeMap = new Map(
        documentTypes.map((d) => [d.developerName, d]),
      );

      // Validate document types
      for (const code of documentCodes) {
        if (!docTypeMap.has(code)) {
          throw new Error(`Invalid document type: ${code}`);
        }
      }

      const requiredDocs = await tx.accountRequiredDocument.findMany({
        where: {
          accountType: account.type,
          documentTypeId: {
            in: documentTypes.map((d) => d.id),
          },
        },
      });

      const requiredDocSet = new Set(requiredDocs.map((d) => d.documentTypeId));

      for (const doc of documentTypes) {
        if (!requiredDocSet.has(doc.id)) {
          throw new Error(
            `Document type ${doc.developerName} is not required for your account type`,
          );
        }
      }

      const entityDocsData = documents.map((d) => ({
        companyId,
        accountId,
        documentTypeId: docTypeMap.get(d.documentTypeCode)!.id,
        url: d.documentUrl,
        documentIdentifier: d.documentIdentifier,
        isVerified: false,
        uploadedAt: new Date(),
      }));

      await tx.entityDocument.createMany({
        data: entityDocsData,
      });

      await tx.companyKyc.upsert({
        where: { accountId },
        create: {
          accountId,
          kybStatus: KycStatus.Submitted,
          kybSubmittedAt: new Date(),
        },
        update: {
          kybStatus: KycStatus.Submitted,
          kybSubmittedAt: new Date(),
        },
      });

      return entityDocsData;
    });
    try {
      await this.notificationService._sendNotification({
        code: AdminNotificationCode.COMPANY_KYB_SUBMITTED,
        audience: NotificationAudience.ADMIN,
        type: NotificationType.Informational,
        data: {
          userName: `${account?.firstname} ${account?.lastname}`,
        },
      });
    } catch (error) {
      console.error('Failed to send notification in director KYB', error);
    }
    return uploadDocumentData;
  }

  async uploadUpdateDocuments(
    accountId: number,
    companyId: number,
    documents: UploadDocumentDto[],
  ) {
    if (!documents.length) return [];

    await this.ensureCompanyExists(companyId);

    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
      select: { id: true, type: true },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const documentCodes = documents.map((d) => d.documentTypeCode);

    return this.prisma.$transaction(async (tx) => {
      const documentTypes = await tx.document.findMany({
        where: { developerName: { in: documentCodes } },
      });

      if (documentTypes.length !== documentCodes.length) {
        throw new Error('Invalid document type');
      }
      const docTypeMap = new Map(
        documentTypes.map((d) => [d.developerName, d]),
      );

      // Validate document types
      for (const code of documentCodes) {
        if (!docTypeMap.has(code)) {
          throw new Error(`Invalid document type: ${code}`);
        }
      }

      const requiredDocs = await tx.accountRequiredDocument.findMany({
        where: {
          accountType: account.type,
          documentTypeId: {
            in: documentTypes.map((d) => d.id),
          },
        },
      });

      const requiredDocSet = new Set(requiredDocs.map((d) => d.documentTypeId));

      for (const doc of documentTypes) {
        if (!requiredDocSet.has(doc.id)) {
          throw new Error(
            `Document type ${doc.developerName} is not required for your account type`,
          );
        }
      }

      const entity = await tx.entityDocument.findFirst({
        where: { accountId, companyId },
      });

      if (entity) {
        await tx.entityDocument.deleteMany({
          where: { accountId, companyId },
        });
      }

      const entityDocsData = documents.map((d) => ({
        companyId,
        accountId,
        documentTypeId: docTypeMap.get(d.documentTypeCode)!.id,
        url: d.documentUrl,
        documentIdentifier: d.documentIdentifier,
        isVerified: false,
        uploadedAt: new Date(),
      }));

      await tx.entityDocument.createMany({
        data: entityDocsData,
      });

      await tx.companyKyc.upsert({
        where: { accountId },
        create: {
          accountId,
          kybStatus: KycStatus.Submitted,
          kybSubmittedAt: new Date(),
        },
        update: {
          kybStatus: KycStatus.Submitted,
          kybSubmittedAt: new Date(),
        },
      });

      return entityDocsData;
    });
  }
}
