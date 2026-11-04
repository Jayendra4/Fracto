export const toIsoDate = (value: any): string | null => {
  if (!value) return null;

  let d: Date | null = null;

  if (typeof value === 'string') {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      d = new Date(Number(yyyy), Number(mm) - 1, Number(dd || 1));
    } else {
      d = new Date(value);
    }
  } else if (value instanceof Date) {
    d = value;
  }

  if (d && !isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return null;
};
