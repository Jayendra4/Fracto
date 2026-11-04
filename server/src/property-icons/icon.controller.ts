import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { IconService } from './icon.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateIconDto } from './dto';
import { AccessGuard, JwtAuthGuard, Role, Roles, RolesGuard } from '@Common';

@ApiTags('Icons')
@Controller('icon')
export class IconController {
  constructor(private readonly iconService: IconService) {}
  @ApiBearerAuth()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post()
  async createIcons(@Body() data: CreateIconDto) {
    return await this.iconService.createIcon({
      iconUrl: data.url,
      name: data.name,
    });
  }

  @Get()
  async getIcons() {
    return await this.iconService.getAllIcons();
  }
}
