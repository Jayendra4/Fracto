import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityService } from './activity.service';
import { GetAllActivityDto } from './dto';

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async getUsers(@Query() query: GetAllActivityDto) {
    return await this.activityService.getAll({
      search: query.search,
      skip: query.skip,
      take: query.take,
      targetId: query.accountId,
    });
  }
}
