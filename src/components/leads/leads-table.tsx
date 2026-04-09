"use client";

import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { columns } from "./columns";
import type { LeadRow } from "@/lib/supabase/types";
import { ITEMS_PER_PAGE } from "@/lib/constants";

interface LeadsTableProps {
  data: LeadRow[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function LeadsTable({
  data,
  totalCount,
  page,
  onPageChange,
  loading,
}: LeadsTableProps) {
  const router = useRouter();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const from = (page - 1) * ITEMS_PER_PAGE + 1;
  const to = Math.min(page * ITEMS_PER_PAGE, totalCount);

  if (loading) {
    return <LeadsTableSkeleton />;
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/80 hover:bg-gray-50/80 border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3 first:pl-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer hover:bg-blue-50/40 transition-colors border-b border-gray-100 last:border-0"
                  onClick={() => router.push(`/leads/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5 first:pl-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-gray-400"
                >
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-1">
        <p className="text-[13px] text-gray-500">
          {totalCount > 0 ? (
            <>
              Mostrando <span className="font-medium text-gray-700">{from}</span>
              {" — "}
              <span className="font-medium text-gray-700">{to}</span> de{" "}
              <span className="font-medium text-gray-700">
                {totalCount.toLocaleString("pt-BR")}
              </span>
            </>
          ) : (
            "Nenhum lead encontrado"
          )}
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="h-8 text-[13px] gap-1 border-gray-200"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Anterior
          </Button>
          <span className="text-[13px] text-gray-500 min-w-[72px] text-center tabular-nums">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="h-8 text-[13px] gap-1 border-gray-200"
          >
            Próximo
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function LeadsTableSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 border-b border-gray-200">
            {["Nome", "Telefone", "Contato", "Temp.", "Score", "Pontos", "Assistido", "Funil"].map(
              (h) => (
                <TableHead key={h} className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3 first:pl-4">
                  {h}
                </TableHead>
              )
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i} className="border-b border-gray-100">
              {Array.from({ length: 8 }).map((_, j) => (
                <TableCell key={j} className="py-2.5 first:pl-4">
                  <Skeleton className="h-5 w-full rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
