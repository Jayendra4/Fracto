import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChartsService } from './chats.service';
import {
  CreateChatroomDto,
  GetAllAssetChatRequestDto,
  GetAllChatsRequestDto,
  GetAllMessageRequestDto,
} from './dto';
import { AuthenticatedRequest, JwtAuthGuard } from '@Common';

@ApiTags('chats')
@ApiBearerAuth()
@Controller('chats')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createChatroom(
    @Body() data: CreateChatroomDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const creatorId = req.user.id;
    return this.chartsService.createChatroom(
      creatorId,
      data.type,
      data.participantIds,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('asset/:assetId')
  async createAssetChat(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const creatorId = req.user.id;
    return this.chartsService.createAssetChatroom(creatorId, assetId);
  }

  @Get('asset/:assetId')
  async getAssetChats(
    @Param('assetId', ParseIntPipe) assetId: number,
    @Query() query: GetAllAssetChatRequestDto,
  ) {
    return await this.chartsService.getAssetChatRoom(assetId, {
      skip: query.skip,
      take: query.take,
    });
  }

  @Get()
  async getUsers(@Query() query: GetAllChatsRequestDto) {
    return await this.chartsService.getChatrooms({
      accountId: query.accountId,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @Get('message')
  async getMessages(@Query() query: GetAllMessageRequestDto) {
    return await this.chartsService.getMessages({
      accountId: query.accountId,
      chatRoomId: query.chatRoomId,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/mark-as-read')
  async markAsRead(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const accountId = req.user.id;

    return this.chartsService.markChatroomAsRead(Number(id), accountId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/clear')
  async clearChat(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.chartsService.clearChat(Number(id), req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/block')
  async blockUser(
    @Param('id') blockedId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const blockerId = req.user.id;

    return this.chartsService.blockUser(blockerId, Number(blockedId));
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/unblock')
  async unblockUser(
    @Param('id') blockedId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const blockerId = req.user.id;

    return this.chartsService.unblockUser(blockerId, Number(blockedId));
  }

  @Get('available-users')
  async getAvailableUsersForChat(@Query() query: GetAllChatsRequestDto) {
    return this.chartsService.getUsersAvailableForChat({
      search: query.search,
      skip: query.skip,
      take: query.take,
      accountId: query.accountId,
    });
  }
}
