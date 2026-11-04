import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { Country, State, City } from 'country-state-city';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.country.findMany();
  }

  async findById(id: number) {
    const country = await this.prisma.country.findUnique({
      where: { id },
    });
    if (!country) {
      throw new Error(`Country with id ${id} not found`);
    }
    return {
      id: country.id,
      name: country.name,
      dialCode: country.dialCode,
      countryCode: country.isoCode,
      flag: country.flag,
    };
  }

  getCountries(search?: string) {
    let countries = Country.getAllCountries();

    if (search) {
      const q = search.toLowerCase();
      countries = countries.filter((c) => c.name.toLowerCase().includes(q));
    }

    return countries.map((c) => ({
      name: c.name,
      code: c.isoCode,
    }));
  }

  getStates(countryCode: string, search?: string) {
    let states = State.getStatesOfCountry(countryCode);

    if (search) {
      const q = search.toLowerCase();
      states = states.filter((s) => s.name.toLowerCase().includes(q));
    }

    return states.map((s) => ({
      name: s.name,
      code: s.isoCode,
    }));
  }

  getCities(countryCode: string, stateCode: string, search?: string) {
    let cities = City.getCitiesOfState(countryCode, stateCode);

    if (search) {
      const q = search.toLowerCase();
      cities = cities.filter((c) => c.name.toLowerCase().includes(q));
    }

    return cities.map((c) => ({
      name: c.name,
    }));
  }
}
