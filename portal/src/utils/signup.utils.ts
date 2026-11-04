import type { SplitDialResult } from '@/interface';

export const splitDialAndMobile = (
  combined: string | undefined
): SplitDialResult => {
  const dialToCountry: Record<string, string> = {
    '+91': 'india',
    '+971': 'uae',
  };

  if (!combined || typeof combined !== 'string') {
    return { country: 'india', dialCode: '+91', mobile: '' };
  }

  const foundDial = Object.keys(dialToCountry).find((d) =>
    combined.startsWith(d)
  );

  if (foundDial) {
    return {
      country: dialToCountry[foundDial],
      dialCode: foundDial,
      mobile: combined,
    };
  }

  return {
    country: 'india',
    dialCode: '+91',
    mobile: combined,
  };
};

export const safeLoadJSON = (key: string): any => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const safeSaveJSON = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};
