import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LocationService } from './location.service';
import { GetCitiesDto, GetStatesDto } from './dto';

@ApiTags('Location')
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('countries')
  getAllCountries() {
    return this.locationService.findAll();
  }

  // @Get(':id')
  // @ApiParam({ name: 'id', type: Number, description: 'Country ID' })
  // getCountryById(@Param('id', ParseIntPipe) id: number) {
  //   return this.locationService.findById(id);
  // }

  // @Get('countries')
  // getCountries(@Query('search') search?: string) {
  //   return this.locationService.getCountries(search);
  // }

  @Get('states')
  getStates(@Query() query: GetStatesDto) {
    return this.locationService.getStates(query.countryCode, query.search);
  }

  @Get('cities')
  getCities(@Query() query: GetCitiesDto) {
    return this.locationService.getCities(
      query.countryCode,
      query.stateCode,
      query.search,
    );
  }
}
