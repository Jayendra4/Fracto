import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  BaseController,
  JwtAuthGuard,
  PermissionsGuard,
  RequirePermissions,
  RolesGuard,
  UserType,
  Roles,
  AccessGuard,
  Role,
} from '@Common';
import { TransactionsService } from '../transactions.service';
import { GetTransactionsRequestDto } from '../dto';

@ApiTags('Transaction')
@ApiBearerAuth()
@Roles(Role.Admin)
@RequirePermissions('transactions.view')
@UseGuards(JwtAuthGuard, AccessGuard, RolesGuard, PermissionsGuard)
@Controller('users/transactions')
export class TransactionsController extends BaseController {
  constructor(private readonly transactionsService: TransactionsService) {
    super();
  }

  @Get()
  async getAll(@Query() query: GetTransactionsRequestDto) {
    return await this.transactionsService.getAll(UserType.Admin, {
      search: query.search,
      filters: {
        accountId: query.accountId ? Number(query.accountId) : undefined,
        fromDate: query.fromDate,
        toDate: query.toDate,
        context: query.context,
        walletType: query.walletType,
        type: query.type,
      },
      export: query.export,
      exportFormat: query.exportFormat,
      skip: query.skip,
      take: query.take,
    });
  }
}
