/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CountriesService {
  private readonly COUNTRYLAYER_API_KEY = '15759b6b505d9b38bc0d42615bc58825';
  private readonly FIXER_API_KEY = '353fed7e4a3a20117fe360f877f490fe';
  
  constructor(private httpService: HttpService) {}

  async getCountryInfo(name: string) {
    try {
      // Fetch country data from CountryLayer API
      const countryResponse = await firstValueFrom(
        this.httpService.get(
          `https://api.countrylayer.com/v2/name/${encodeURIComponent(name)}?access_key=${this.COUNTRYLAYER_API_KEY}`
        )
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!countryResponse.data || countryResponse.data.length === 0) {
        throw new NotFoundException('Country not found');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const country = countryResponse.data[0];
      
      // Extract currency codes from CountryLayer response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const currencies = country.currencies || [];
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (currencies.length === 0) {
        throw new NotFoundException('No currency information available');
      }

      // Fetch exchange rates for these currencies
      const rates = await this.getExchangeRates(currencies);

      // Format currency response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const currencyList = currencies.map(currency => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol || currency.code,
        rate: rates[currency.code] || 1,
      }));

      return {
        name: country.name,
        officialName: country.nativeName || country.name,
        population: country.population,
        currencies: currencyList,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('CountryLayer API error:', error.message);
      throw new NotFoundException('Country not found or API error');
    }
  }

  private async getExchangeRates(currencies: any[]): Promise<Record<string, number>> {
    const currencyCodes = currencies.map(c => c.code);
    
    try {
      // Note: Fixer.io free tier only supports EUR as base currency
      // We need to fetch latest rates and convert to USD base
      const response = await firstValueFrom(
        this.httpService.get(
          `https://data.fixer.io/api/latest?access_key=${this.FIXER_API_KEY}&symbols=${currencyCodes.join(',')},USD`
        )
      );

      if (!response.data || !response.data.success) {
        const errorMsg = response.data?.error?.info || 'Unknown Fixer API error';
        throw new Error(`Fixer API error: ${errorMsg}`);
      }

      const rates = response.data.rates;
      const usdRate = rates.USD;

      if (!usdRate) {
        throw new Error('USD rate not found in Fixer response');
      }

      // Convert all rates from EUR base to USD base
      // Formula: rate_in_usd = rate_in_eur / usd_in_eur
      const usdBasedRates: Record<string, number> = {};
      for (const code of currencyCodes) {
        if (rates[code]) {
          usdBasedRates[code] = rates[code] / usdRate;
        } else {
          throw new Error(`Exchange rate not found for currency: ${code}`);
        }
      }

      return usdBasedRates;
    } catch (error) {
      console.error('Exchange rate fetch error:', error.message);
      throw new NotFoundException(`Unable to fetch exchange rates: ${error.message}`);
    }
  }
}
