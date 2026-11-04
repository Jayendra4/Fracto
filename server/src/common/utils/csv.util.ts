export interface CsvColumn<T = any> {
  key: string;
  header: string;
  format?: (row: T) => unknown;
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';

  const str = value instanceof Date ? value.toISOString() : String(value);

  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function toCsv<T extends Record<string, any>>(
  rows: T[],
  columns: CsvColumn<T>[],
): string {
  const header = columns.map((column) => escapeCsvValue(column.header));
  const lines = rows.map((row) =>
    columns
      .map((column) =>
        escapeCsvValue(column.format ? column.format(row) : row[column.key]),
      )
      .join(','),
  );

  return [header.join(','), ...lines].join('\r\n') + '\r\n';
}
