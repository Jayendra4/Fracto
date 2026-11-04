import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import {
  AdminNotificationCode,
  JwtPayload,
  NotificationAudience,
  NotificationCode,
  UserType,
} from '@Common';
import {
  LoginRequestDto,
  SendCodeRequestType,
  VerifyEmailMobileDto,
  VerifyPasswordRequestDto,
} from './dto';

import {
  OtpContext,
  OtpService,
  SendCodeResponse,
  VerifyCodeResponse,
} from '../otp';

import { AccountsService } from '../accounts';
import {
  Account,
  AccountType,
  NotificationType,
  OtpTransport,
} from '../generated/prisma/client';
import { PrismaService } from '../prisma';
import { NotificationService } from '../notification';

export type ValidAuthResponse = {
  accessToken: string;
  type: UserType | AccountType;
};

export type InvalidVerifyCodeResponse = {
  email?: VerifyCodeResponse;
  mobile?: VerifyCodeResponse;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly accountService: AccountsService,
    private readonly notificationService: NotificationService,
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  private generateJwt(payload: JwtPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }

  async sendCode(
    target: string,
    transport: OtpTransport,
    type: SendCodeRequestType,
  ): Promise<SendCodeResponse> {
    if (type === SendCodeRequestType.Register) {
      if (
        transport === OtpTransport.Email &&
        (await this.accountService.isEmailExist(target))
      ) {
        throw new Error('Email already in use');
      }
      if (
        transport === OtpTransport.Mobile &&
        (await this.accountService.isMobileExist(target))
      ) {
        throw new Error('Mobile already in use');
      }

      return await this.otpService.send({
        context: OtpContext.Register,
        target,
        ...(transport === OtpTransport.Email
          ? {
              transport,
              transportParams: {
                username: 'User',
              },
            }
          : { transport }),
      });
    } else {
      console.log('dataata');
      return await this.otpService.send({
        context: OtpContext.Login,
        target,
        ...(transport === OtpTransport.Email
          ? {
              transport,
              transportParams: {
                username: 'User',
              },
            }
          : { transport }),
      });
    }
  }

  async login(
    userId: number,
    type: UserType | AccountType,
  ): Promise<ValidAuthResponse> {
    return {
      accessToken: this.generateJwt({
        sub: userId,
        type,
      }),
      type,
    };
  }

  async verifyBothOtps(dto: VerifyEmailMobileDto) {
    const verifyEmail = await this.otpService.verify(
      dto.emailCode,
      dto.email,
      OtpTransport.Email,
    );

    const verifyMobile = await this.otpService.verify(
      dto.mobileCode,
      dto.mobile,
      OtpTransport.Mobile,
    );

    if (!verifyEmail.status) {
      throw new Error('Invalid Email verification code');
    }

    if (!verifyMobile.status) {
      throw new Error('Invalid Mobile verification code');
    }
    return {
      message: 'OTP Verified Successfully',
      status: true,
    };
  }

  async verifyPassword(data: VerifyPasswordRequestDto) {
    const user = await this.accountService.validateCredentials(
      data.email || data.mobile,
      data.password,
    );
    if (user === false) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    return user;
  }

  async verifyOtp(
    data: LoginRequestDto,
  ): Promise<InvalidVerifyCodeResponse | null> {
    let emailResult = null;
    let mobileResult = null;

    if (data.emailVerificationCode) {
      if (data.email) {
        emailResult = await this.otpService.verify(
          data.emailVerificationCode,
          data.email,
          OtpTransport.Email,
        );
      }
    }

    if (data.mobileVerificationCode) {
      if (data.mobile) {
        mobileResult = await this.otpService.verify(
          data.mobileVerificationCode,
          data.mobile,
          OtpTransport.Mobile,
        );
      }
    }

    if (
      (emailResult && !emailResult.status) ||
      (mobileResult && !mobileResult.status)
    ) {
      return {
        email: emailResult || undefined,
        mobile: mobileResult || undefined,
      };
    }

    return null; // Explicit success
  }

  async registerUser(data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    dialCode?: string;
    mobile?: string;
    countryId: number;
    accountType: AccountType;
    referralCode?: string;
    emailVerificationCode?: string;
    mobileVerificationCode?: string;
  }): Promise<InvalidVerifyCodeResponse | ValidAuthResponse> {
    const [verifyEmailOtpResponse, verifyMobileOtpResponse] = await Promise.all(
      [
        data.email &&
          this.otpService.verify(
            data.emailVerificationCode || '',
            data.email,
            OtpTransport.Email,
          ),
        data.mobile &&
          this.otpService.verify(
            data.mobileVerificationCode || '',
            data.mobile,
            OtpTransport.Mobile,
          ),
      ],
    );
    if (
      (verifyEmailOtpResponse && !verifyEmailOtpResponse.status) ||
      (verifyMobileOtpResponse && !verifyMobileOtpResponse.status)
    ) {
      return {
        email: verifyEmailOtpResponse || undefined,
        mobile: verifyMobileOtpResponse || undefined,
      };
    }

    const user = await this.accountService.create({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
      dialCode: data.dialCode,
      mobile: data.mobile,
      countryId: data.countryId,
      referralCode: data.referralCode,
      accountType: data.accountType,
    });

    if (user) {
      try {
        await this.notificationService._sendNotification({
          code: AdminNotificationCode.REGISTRATION_NOTIFICATION,
          audience: NotificationAudience.ADMIN,
          type: NotificationType.Informational,
          data: {
            userName: `${user.firstname} ${user.lastname}`,
          },
        });

        await this.notificationService._sendNotification({
          code: NotificationCode.USER_REGISTRATION_NOTIFICATION,
          audience: NotificationAudience.USER,
          type: NotificationType.Informational,
          createdById: user.id,
          userIds: [user.id],
          data: {
            userName: `${user.firstname} ${user.lastname}`,
          },
        });
      } catch (error) {
        console.error(
          'Failed to send notification for new user registration',
          error,
        );
      }
    }
    return {
      accessToken: this.generateJwt({
        sub: user.id,
        type: user.type,
      }),
      type: user.type,
    };
  }

  async forgotPassword(
    email?: string,
    mobile?: string,
  ): Promise<{ email?: SendCodeResponse; mobile?: SendCodeResponse }> {
    return await this.accountService.sendResetPasswordVerificationCode(
      email,
      mobile,
    );
  }

  async resetPassword(
    code: string,
    newPassword: string,
    mobile?: string,
    email?: string,
  ): Promise<Account> {
    return await this.accountService.resetPassword(
      code,
      newPassword,
      mobile,
      email,
    );
  }

  async saveToken(
    userId: number,
    data: {
      token: string;
    },
  ) {
    if (!data.token) {
      throw new Error('FCM token is required');
    }

    return this.prisma.userDeviceToken.upsert({
      where: {
        token: data.token,
      },
      update: {
        userId,
        isActive: true,
      },
      create: {
        userId,
        token: data.token,
        isActive: true,
      },
    });
  }

  async updateTypeAndReLogin(
    userId: number,
    newType: AccountType,
  ): Promise<ValidAuthResponse> {
    await this.accountService.updateProfileDetails({
      accountId: userId,
      type: newType,
    });

    return this.login(userId, newType);
  }

  async checkIdentifierExists(data: { email?: string; mobile?: string }) {
    if (!data.email && !data.mobile) {
      throw new Error('Either email or mobile is required');
    }
    const user = await this.prisma.account.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.mobile ? [{ mobile: data.mobile }] : []),
        ],
      },
      select: {
        id: true,
        email: true,
        mobile: true,
      },
    });

    if (!user) {
      return {
        exists: false,
      };
    }

    return {
      exists: true,
      message:
        user.email === data.email
          ? `${data.email} already exists`
          : `${data.mobile} already exists`,
    };
  }
}
