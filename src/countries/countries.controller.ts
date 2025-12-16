import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CountriesService } from './countries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('countries')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class CountriesController {
  constructor(private countriesService: CountriesService) { }

  @Get(':name')
  async getCountry(@Param('name') name: string) {
    return this.countriesService.getCountryInfo(name);
  }
}
