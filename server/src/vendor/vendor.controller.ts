import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VendorService } from './vendor.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateVendorSuggestionDto,
  GetAllVendorRequestDto,
  ReviewVendorSuggestionDto,
  UpdateVendorRequestDto,
} from './dto';
import {
  AccessGuard,
  AuthenticatedRequest,
  JwtAuthGuard,
  Role,
  Roles,
  RolesGuard,
} from '@Common';
import { GetAllVendorSuggestionRequestDto } from './dto/get-all-vendor-suggestion.dto';

@ApiBearerAuth()
@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @UseGuards(JwtAuthGuard)
  @Post('suggestions')
  async suggestVendor(
    @Body() data: CreateVendorSuggestionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.vendorService.sendSuggestionToAdmin(req.user.id, {
      category: data.category,
      email: data.email,
      mobile: data.mobile,
      vendorName: data.vendorName,
      description: data.description,
      website: data.website,
    });
  }

  @Get('suggestions')
  async getAllVendorsSuggestions(
    @Query() query: GetAllVendorSuggestionRequestDto,
  ) {
    return await this.vendorService.getAllVendorsSuggestions({
      search: query.search,
      skip: query.skip,
      take: query.take,
      filters: {
        category: query.category,
        status: query.status,
      },
    });
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Post()
  async create(
    @Body() data: CreateVendorSuggestionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.vendorService.create(req.user.id, {
      category: data.category,
      email: data.email,
      mobile: data.mobile,
      vendorName: data.vendorName,
      description: data.description,
      website: data.website,
    });
  }

  @Get()
  async getAllVendors(@Query() query: GetAllVendorRequestDto) {
    return await this.vendorService.getAllVendors({
      search: query.search,
      skip: query.skip,
      take: query.take,
      isActive: query.isActive,
      filters: {
        category: query.category,
      },
    });
  }

  @Get(':id')
  async getVendor(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorService.getVendor(id);
  }

  @Delete(':id')
  async deleteVendor(@Param('id', ParseIntPipe) id: number) {
    return await this.vendorService.deleteVendor(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() data: UpdateVendorRequestDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return await this.vendorService.update(req.user.id, {
      vendorId: Number(id),
      category: data.category,
      email: data.email,
      mobile: data.mobile,
      name: data.name,
      description: data.description,
      website: data.website,
      isActive: data.isActive,
    });
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard, AccessGuard, RolesGuard)
  @Patch(':id/review')
  @ApiOperation({ summary: 'review vendor suggestion' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: ReviewVendorSuggestionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.vendorService.reviewSuggestion(id, req.user.id, data.status);
  }
}
