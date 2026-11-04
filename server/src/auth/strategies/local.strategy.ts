import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { ValidatedUser } from '@Common';
import { LOCAL_AUTH } from '../auth.constants';

import { AdminService } from '../../admin';
import { AccountsService } from '../../accounts';
import { AccountType } from '../../generated/prisma/enums';
import { LoginPanel } from '../dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, LOCAL_AUTH) {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly adminService: AdminService,
  ) {
    super({
      usernameField: 'password',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    identifier: string,
    password: string,
  ): Promise<ValidatedUser> {
    const { email, mobile, loginPanel } = req.body;
    if (!loginPanel) {
      throw new UnauthorizedException(
        'panel is required (admin | trustee | user)',
      );
    }

    const emailOrMobile = email || mobile;
    if (!emailOrMobile) {
      throw new UnauthorizedException('Email or mobile is required');
    }

    let user: ValidatedUser | false | null;

    switch (loginPanel) {
      case LoginPanel.Admin:
        user = await this.adminService.validateCredentials(
          emailOrMobile,
          password,
        );
        break;

      case LoginPanel.Trustee:
        user = await this.accountsService.validateCredentials(
          emailOrMobile,
          password,
          [AccountType.Trustee],
        );
        break;

      case LoginPanel.User:
        user = await this.accountsService.validateCredentials(
          emailOrMobile,
          password,
          [
            AccountType.AssetOwner,
            AccountType.CorporateInvestor,
            AccountType.Company,
            AccountType.Broker,
            AccountType.Business,
          ],
        );
        break;

      default:
        throw new UnauthorizedException('Invalid panel');
    }

    if (user === false) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (user === null) {
      const admin = await this.adminService.validateCredentials(
        emailOrMobile,
        password,
      );

      if (admin) {
        throw new UnauthorizedException(
          'Admin credentials are only valid for the Admin panel. Access denied.',
        );
      }

      const trustee = await this.accountsService.validateCredentials(
        emailOrMobile,
        password,
        [AccountType.Trustee],
      );

      if (trustee) {
        throw new UnauthorizedException(
          'Trustee credentials are only valid for the Trustee panel. Access denied.',
        );
      }

      const appUser = await this.accountsService.validateCredentials(
        emailOrMobile,
        password,
        [
          AccountType.AssetOwner,
          AccountType.CorporateInvestor,
          AccountType.Company,
          AccountType.Broker,
          AccountType.Business,
        ],
      );

      if (appUser) {
        throw new UnauthorizedException(
          'User credentials are only valid for the User panel. Access denied.',
        );
      }
    }

    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    return user;
  }
}
