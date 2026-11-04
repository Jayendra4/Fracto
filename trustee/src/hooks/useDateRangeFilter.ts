import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { startOfToday, subDays, startOfMonth, endOfMonth } from 'date-fns';

export function useDateRangeFilter(initial?: DateRange) {
  const [range, setRange] = useState<DateRange | undefined>(
    initial ?? {
      from: subDays(startOfToday(), 6),
      to: startOfToday(),
    }
  );

  const presets = {
    today: () => ({
      from: startOfToday(),
      to: startOfToday(),
    }),
    last7Days: () => ({
      from: subDays(startOfToday(), 6),
      to: startOfToday(),
    }),
    last30Days: () => ({
      from: subDays(startOfToday(), 29),
      to: startOfToday(),
    }),
    thisMonth: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  };

  return {
    range,
    setRange,
    presets,
  };
}
