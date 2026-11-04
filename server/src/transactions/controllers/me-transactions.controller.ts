import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BaseController,
  JwtAuthGuard,
  UserType,
  AuthenticatedRequest,
  AccessGuard,
} from '@Common';
import { TransactionsService } from '../transactions.service';
import { GetUserTransactionsRequestDto } from '../dto';

@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('users/me/transactions')
export class MeTransactionsController extends BaseController {
  constructor(private readonly transactionsService: TransactionsService) {
    super();
  }

  @Get()
  async getAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetUserTransactionsRequestDto,
  ) {
    const ctx = this.getContext(req);
    return await this.transactionsService.getAll(UserType.User, {
      filters: {
        accountId: Number(ctx.user.id),
        fromDate: query.fromDate,
        toDate: query.toDate,
        context: query.context,
        walletType: query.walletType,
        type: query.type,
      },
      skip: query.skip,
      take: query.take,
    });
  }
}
