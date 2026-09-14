import React from 'react';
import { SkeletonRow } from './LoadingState';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  data?: T[];
  columns?: Column<T>[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  keyExtractor?: (item: T) => string;
  className?: string;
  children?: React.ReactNode;
}

export function Table<T>({
  data,
  columns,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  keyExtractor,
  className = '',
  children,
}: TableProps<T>) {
  if (children) {
    return (
      <div className={`bg-white border border-surface-border rounded-xl overflow-hidden shadow-xs ${className}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">{children}</table>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-surface-border rounded-xl overflow-hidden shadow-xs ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-surface-border">
              {(columns || []).map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border text-sm">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx}>
                  <td colSpan={(columns || []).length} className="p-0">
                    <SkeletonRow />
                  </td>
                </tr>
              ))
            ) : !data || data.length === 0 ? (
              <tr>
                <td colSpan={(columns || []).length} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} className="border-none rounded-none" />
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor ? keyExtractor(item) : Math.random().toString()}
                  className="hover:bg-surface-hover transition-colors group text-text-primary"
                >
                  {(columns || []).map((col, idx) => (
                    <td key={idx} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                      {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey] ?? '') : ''}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <thead className={`bg-slate-50 border-b border-surface-border ${className}`}>{children}</thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-surface-border text-sm ${className}`}>{children}</tbody>
);

export const TableRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <tr className={`hover:bg-slate-50 transition-colors ${className}`}>{children}</tr>
);

export const TableHead: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary ${className}`}>{children}</th>
);

export const TableCell: React.FC<{ children?: React.ReactNode; className?: string; colSpan?: number }> = ({ children, className = '', colSpan }) => (
  <td colSpan={colSpan} className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>{children}</td>
);
