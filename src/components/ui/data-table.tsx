import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import React from "react";

interface Column<T> {
  key: string;
  header: React.ReactNode | (() => React.ReactNode);
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  emptyMessage = "Nenhum dado encontrado",
}: DataTableProps<T>) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-200">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "h-12 px-4 text-left align-middle font-bold text-slate-900",
                  column.className
                )}
              >
                {typeof column.header === "function"
                  ? (column.header as Function)()
                  : column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={cn("p-4 align-middle", column.className)}
                  >
                    {column.render
                      ? column.render(item)
                      : (item as any)[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-slate-500 font-medium"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}