import { Prisma } from 'src/generated/prisma/client';

export const countries: Prisma.CountryCreateInput[] = [
  {
    name: 'India',
    dialCode: '+91',
    isoCode: 'IN',
    flag: '🇮🇳',
  },
  // {
  //   name: 'Uae',
  //   dialCode: '+971',
  //   isoCode: 'AE',
  //   flag: '🇦🇪',
  // },
];
