import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CountriesService } from './countries.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('countries')
@UseGuards(AuthGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class CountriesController {
  constructor(private countriesService: CountriesService) {}

  @Get(':name')
  async getCountry(@Param('name') name: string) {
    return this.countriesService.getCountryInfo(name);
  }
}
