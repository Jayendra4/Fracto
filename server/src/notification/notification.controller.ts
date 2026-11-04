import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AccessGuard, AuthenticatedRequest, JwtAuthGuard } from '@Common';
import { GetNotificationRequestDto } from './dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my notification' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  async getNotification(
    @Req() req: AuthenticatedRequest,
    @Query() query: GetNotificationRequestDto,
  ) {
    return this.notificationService.getNotifications(
      req.user.id,
      {
        search: query.search,
        skip: query.skip,
        take: query.take,
        fromDate: query.fromDate,
        toDate: query.toDate,
      },
      req.user.type,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @ApiOperation({ summary: 'Mark notification as read' })
  @Patch(':notificationId/read')
  async markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('notificationId', ParseIntPipe) notificationId: number,
  ) {
    return this.notificationService.markAsRead(req.user.id, notificationId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AccessGuard)
  @Patch('read-all')
  markAllRead(@Req() req: AuthenticatedRequest) {
    return this.notificationService.markAllAsRead(req.user.id);
  }
}
