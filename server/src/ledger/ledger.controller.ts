import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { CreateAssetFracDto } from './dto/create-asset.dto';
import { TransferFractionDto } from './dto/transfer-fraction.dto';
import { CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Ledger')
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post('asset')
  @ApiOperation({
    summary: 'Create a new asset with fractional ownership (Localhost Only)',
  })
  @ApiBody({ type: CreateAssetFracDto })
  @ApiResponse({ status: 201, description: 'Asset created successfully' })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createAsset(@Body() createAssetDto: CreateAssetFracDto) {
    return this.ledgerService.createAsset(
      createAssetDto.id,
      createAssetDto.assetType,
      createAssetDto.subType,
      createAssetDto.owner,
      createAssetDto.appraisedValue,
      createAssetDto.totalFractions,
    );
  }
  @CacheTTL(10)
  @Get('assets')
  @ApiOperation({ summary: 'Get all assets on the ledger (Localhost Only)' })
  @ApiResponse({ status: 200, description: 'List of all assets' })
  async getAllAssets() {
    return this.ledgerService.getAllAssets();
  }

  @Post('transfer')
  @ApiOperation({
    summary:
      'Transfer fractions of an asset from one owner to another (Localhost Only)',
  })
  @ApiBody({ type: TransferFractionDto })
  @ApiResponse({
    status: 201,
    description: 'Fraction transferred successfully',
  })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async transferFraction(@Body() transferFractionDto: TransferFractionDto) {
    return this.ledgerService.transferFraction(
      transferFractionDto.id,
      transferFractionDto.fromOwner,
      transferFractionDto.toOwner,
      transferFractionDto.fractionCount,
    );
  }
  @CacheTTL(10)
  @Get('asset/:id')
  @ApiOperation({ summary: 'Get asset details by asset ID' })
  @ApiParam({ name: 'id', required: true, description: 'Asset ID' })
  @ApiResponse({ status: 200, description: 'Asset details' })
  async readAsset(@Param('id') id: string) {
    return this.ledgerService.readAsset(id);
  }
}
