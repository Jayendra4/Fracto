export const COUNTRY_CONFIG = {
  INDIA: {
    code: '+91',
    regex: /^[6-9]\d{9}$/,
  },
  UAE: {
    code: '+971',
    regex: /^5\d{8}$/,
  },
};

export type Country = keyof typeof COUNTRY_CONFIG;
