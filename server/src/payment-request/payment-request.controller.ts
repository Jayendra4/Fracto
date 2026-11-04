import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentRequestService } from './payment-request.service';
import {
  AccessGuard,
  AuthenticatedRequest,
  BaseController,
  JwtAuthGuard,
  // PermissionsGuard,
  RequirePermissions,
  Role,
  Roles,
  // RolesGuard,
} from '@Common';
import { CreatePaymentRequestDto } from './dto/create-payment-request.dto';
import { UpdatePaymentRequestStatusDto } from './dto/update-payment-request-status.dto';
import {
  CreateDepositPaymentRequestDto,
  CreateManualDepositRequestDto,
  CreatePayoutRequestDto,
  PaymentRequestFilterDto,
  VerifyPaymentDto,
} from './dto';

@ApiTags('Payment Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AccessGuard)
@Controller('payment-request')
export class PaymentRequestController extends BaseController {
  constructor(private readonly paymentRequestService: PaymentRequestService) {
    super();
  }

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreatePaymentRequestDto,
  ) {
    const ctx = this.getContext(req);
    return this.paymentRequestService.create(ctx.user.id, {
      requestType: data.requestType,
      methodType: data.methodType,
      amount: data.amount,
      bankAccountId: data.bankAccountId,
      upiAccountId: data.upiAccountId,
      utrNumber: data.utrNumber,
      screenshot: data.screenshot,
    });
  }

  @Post('deposit/initiate')
  async initiateDeposit(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateDepositPaymentRequestDto,
  ) {
    return this.paymentRequestService.createDepositRequest(req.user.id, {
      amount: data.amount,
      methodType: data.methodType,
      bankAccountId: data.bankAccountId,
      upiAccountId: data.upiAccountId,
    });
  }

  @Post('deposit/manual')
  async createManualDeposit(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateManualDepositRequestDto,
  ) {
    return this.paymentRequestService.createManualDepositRequest(req.user.id, {
      amount: data.amount,
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      utrNumber: data.utrNumber,
      screenshot: data.screenshot,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-payment')
  async verifyPayment(
    @Req() req: AuthenticatedRequest,
    @Body() data: VerifyPaymentDto,
  ) {
    return this.paymentRequestService.verifyClientPayment(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('payout-request')
  async createPayoutRequest(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreatePayoutRequestDto,
  ) {
    return this.paymentRequestService.payoutRequest(req.user.id, {
      amount: data.amount,
      methodType: data.methodType,
      bankAccountId: data.bankAccountId,
      upiAccountId: data.upiAccountId,
      fundAccountId: data.fundAccountId,
      walletType: data.WalletType,
    });
  }

  @Get()
  @ApiBearerAuth()
  @RequirePermissions('secondary_group.manual_payment_view.view')
  // @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard, PermissionsGuard)
  @ApiOperation({ summary: 'Get payment requests with filters' })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: PaymentRequestFilterDto,
  ) {
    const ctx = this.getContext(req);
    return this.paymentRequestService.findAll(
      ctx.user.id,
      ctx.user.type,
      query,
      query.accountId,
    );
  }

  @Roles(Role.Admin, Role.Trustee)
  // Approve vs reject, and deposit_request vs withdrawal_request, are
  // picked dynamically in PaymentRequestService.updateStatus (via
  // assertPermission) based on the request's actual type/status — a static
  // @RequirePermissions here can't express that branch.
  // @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard, PermissionsGuard)
  @Patch(':id/status')
  async updateStatus(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePaymentRequestStatusDto,
  ) {
    const ctx = this.getContext(req);
    return this.paymentRequestService.updateStatus(
      ctx.user,
      id,
      data.status,
      data.remark,
    );
  }
}
