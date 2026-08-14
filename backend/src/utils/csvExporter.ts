/**
 * Utility for formatting database records into CSV formatted string buffers
 * for admin analytics, sales reports, and inventory exports.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

export function generateCsv<T>(data: T[], columns: ExportColumn<T>[]): string {
  if (!data || data.length === 0) {
    return columns.map((col) => `"${col.header}"`).join(',') + '\n';
  }

  const headerRow = columns.map((col) => `"${escapeCsvValue(col.header)}"`).join(',');
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const val = col.accessor(row);
        return `"${escapeCsvValue(val != null ? String(val) : '')}"`;
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

function escapeCsvValue(val: string): string {
  return val.replace(/"/g, '""');
}
