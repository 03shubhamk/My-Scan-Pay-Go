import { formatCurrency, truncateText } from './formatters';

describe('Admin Formatting Utilities', () => {
  test('should format currency in INR correctly', () => {
    const formatted = formatCurrency(499.50);
    expect(formatted).toContain('499.50');
  });

  test('should truncate long strings with ellipsis', () => {
    expect(truncateText('Organic Whole Milk 1 Litre Pack', 15)).toBe('Organic Whole ...');
    expect(truncateText('Short String', 20)).toBe('Short String');
  });
});
