'use client';

import { useState } from "react";
import { Search } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchKeys = [],
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? data.filter((row) =>
        searchKeys.some((k) =>
          String(row[k] ?? "").toLowerCase().includes(query.toLowerCase())
        )
      )
    : data;

  return (
    <div className="space-y-3">
      {searchKeys.length > 0 && (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-soft-gray/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-soft-gray placeholder-soft-gray/30 focus:outline-none focus:border-electric-blue/50"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/3">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-soft-gray/50 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-soft-gray/30 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-soft-gray/80">
                      {col.render
                        ? col.render(row)
                        : String(row[col.key as keyof T] ?? "")}
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
