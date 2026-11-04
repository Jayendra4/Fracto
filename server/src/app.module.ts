import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { CommonModule, StorageService } from '@Common';
import { AppController } from './app.controller';
import { AppCacheInterceptor } from './app-cache.interceptor';
import { PrismaModule } from './prisma';
import { AuthModule } from './auth';
import { RedisModule } from './redis';
import { AccountsModule } from './accounts';
import { CompanyModule } from './company/company.module';
import { DirectorModule } from './director/director.module';
import { CountryModule } from './location/location.module';
import { DocumentModule } from './document/document.module';
import { AssetModule } from './asset/asset.module';
import { LedgerModule } from './ledger/ledger.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { TrusteeModule } from './trustee/trustee.module';
import { UpiAccountModule } from './upi-account/upi-account.module';
import { PaymentRequestModule } from './payment-request/payment-request.module';
import { WalletsModule } from './wallets';
import { TransactionsModule } from './transactions';
import { WalletTransactionsModule } from './wallet-transactions';
import { AssetPurchaseModule } from './asset-purchase/asset-purchase.module';
import { NotificationModule } from './notification/notification.module';
import { KycModule } from './kyc/kyc.module';
import { OverviewModule } from './overview/overview.module';
import { BrokerModule } from './broker/broker.module';
import { CouponModule } from './coupon/coupon.module';
import { VendorModule } from './vendor/vendor.module';
import { ActivityModule } from './activity/activity.module';
import { ChartsModule } from './chats/chats.module';
import { IconModule } from './property-icons';
import { CategoryModule } from './category/category.module';
import { GroupModule } from './group/group.module';
import { JoinGroupModule } from './join-group/join-group.module';
import { ShareAssetModule } from './share-assets/share-asset.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ContactUsModule } from './contact-us/contact-us.module';
import { VoteModule } from './vote/vote.module';
import { ClubMembershipModule } from './club-membership/club-membership.module';
import { SpvModule } from './spv/spv.module';
import { ReportsModule } from './reports';
import { AdminModule } from './admin';
import { SystemModule } from './system';
import { RolesModule } from './roles';

@Module({
  imports: [
    MulterModule.registerAsync({
      useFactory: (storageService: StorageService) => ({
        ...storageService.defaultMulterOptions,
      }),
      inject: [StorageService],
    }),
    CacheModule.register({ isGlobal: true, ttl: 1 }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    CommonModule,
    PrismaModule,
    RedisModule,
    AuthModule,
    AccountsModule,
    CompanyModule,
    DirectorModule,
    CountryModule,
    DocumentModule,
    AssetModule,
    LedgerModule,
    BankAccountModule,
    TrusteeModule,
    UpiAccountModule,
    PaymentRequestModule,
    WalletsModule,
    TransactionsModule,
    WalletTransactionsModule,
    AssetPurchaseModule,
    NotificationModule,
    KycModule,
    OverviewModule,
    BrokerModule,
    CouponModule,
    VendorModule,
    ActivityModule,
    ChartsModule,
    IconModule,
    CategoryModule,
    GroupModule,
    JoinGroupModule,
    ShareAssetModule,
    MarketplaceModule,
    ContactUsModule,
    VoteModule,
    ClubMembershipModule,
    SpvModule,
    ReportsModule,
    AdminModule,
    SystemModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AppCacheInterceptor,
    },
  ],
})
export class AppModule {}
