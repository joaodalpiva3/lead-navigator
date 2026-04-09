"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadsFilters } from "@/components/leads/leads-filters";
import { Header } from "@/components/layout/header";
import { CampaignSelector } from "@/components/campaign-selector";
import { LeadsTable } from "@/components/leads/leads-table";
import { LeadCard } from "@/components/leads/lead-card";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { exportLeadsCSV, exportLeadsXLSX } from "@/lib/export-leads";
import type { LeadRow } from "@/lib/supabase/types";

export function LeadsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const campaignParam = searchParams.get("campaign") || "";
  const campaignIds = campaignParam.split(",").filter(Boolean);
  const page = Number(searchParams.get("page") || "1");
  const sortBy = searchParams.get("sort") || "score_propensao";

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchTerm, 300);

  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (campaignIds.length === 0) return;
    setLoading(true);

    const supabase = createClient();

    const rpcParams: Record<string, unknown> = {
      p_campaign_ids: campaignIds,
      p_page: page,
      p_per_page: ITEMS_PER_PAGE,
      p_sort_by: sortBy,
      p_sort_dir: "desc",
    };

    if (debouncedSearch) {
      rpcParams.p_search = debouncedSearch;
    }

    // Parse filter params from URL
    const temperatura = searchParams.get("temperatura");
    if (temperatura) rpcParams.p_temperatura = temperatura.split(",");

    const revenueRange = searchParams.get("revenue_range");
    if (revenueRange) rpcParams.p_revenue_range = revenueRange.split(",");

    const eventoCompra = searchParams.get("evento_compra");
    if (eventoCompra) rpcParams.p_evento_compra = eventoCompra.split(",");

    const flags = [
      "preencheu_pesquisa",
      "entrou_grupo",
      "agente_liberado",
      "recebeu_pv",
      "recebeu_analise",
    ];
    flags.forEach((flag) => {
      const val = searchParams.get(flag);
      if (val === "true") rpcParams[`p_${flag}`] = true;
    });

    const minTempo = searchParams.get("min_tempo");
    if (minTempo) rpcParams.p_min_tempo_assistido = Number(minTempo);

    const minPoints = searchParams.get("min_points");
    if (minPoints) rpcParams.p_min_points = Number(minPoints);

    const maxPoints = searchParams.get("max_points");
    if (maxPoints) rpcParams.p_max_points = Number(maxPoints);

    const countParams: Record<string, unknown> = {
      p_campaign_ids: campaignIds,
    };
    if (debouncedSearch) countParams.p_search = debouncedSearch;
    if (temperatura) countParams.p_temperatura = temperatura.split(",");
    if (revenueRange) countParams.p_revenue_range = revenueRange.split(",");
    if (eventoCompra) countParams.p_evento_compra = eventoCompra.split(",");
    if (searchParams.get("preencheu_pesquisa") === "true")
      countParams.p_preencheu_pesquisa = true;
    if (searchParams.get("entrou_grupo") === "true")
      countParams.p_entrou_grupo = true;
    if (searchParams.get("agente_liberado") === "true")
      countParams.p_agente_liberado = true;
    if (searchParams.get("recebeu_pv") === "true")
      countParams.p_recebeu_pv = true;
    if (searchParams.get("recebeu_analise") === "true")
      countParams.p_recebeu_analise = true;
    if (minTempo) countParams.p_min_tempo_assistido = Number(minTempo);
    if (minPoints) countParams.p_min_points = Number(minPoints);
    if (maxPoints) countParams.p_max_points = Number(maxPoints);

    // Fetch leads and count in parallel
    const [leadsResult, countResult] = await Promise.all([
      supabase.rpc("get_leads_by_campaign", rpcParams),
      supabase.rpc("get_leads_count", countParams),
    ]);

    if (leadsResult.data) {
      setLeads(leadsResult.data as LeadRow[]);
    }
    if (countResult.data != null) {
      setTotalCount(Number(countResult.data));
    }

    setLoading(false);
  }, [campaignParam, page, sortBy, debouncedSearch, searchParams]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Update search in URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.replace(`?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`?${params.toString()}`, { scroll: false });
  }

  async function handleExport(format: "csv" | "xlsx") {
    if (campaignIds.length === 0) return;
    setExporting(true);

    try {
      const supabase = createClient();
      const rpcParams: Record<string, unknown> = {
        p_campaign_ids: campaignIds,
        p_page: 1,
        p_per_page: 50000,
        p_sort_by: sortBy,
        p_sort_dir: "desc",
      };

      if (debouncedSearch) rpcParams.p_search = debouncedSearch;

      const temperatura = searchParams.get("temperatura");
      if (temperatura) rpcParams.p_temperatura = temperatura.split(",");

      const revenueRange = searchParams.get("revenue_range");
      if (revenueRange) rpcParams.p_revenue_range = revenueRange.split(",");

      const eventoCompra = searchParams.get("evento_compra");
      if (eventoCompra) rpcParams.p_evento_compra = eventoCompra.split(",");

      const flags = [
        "preencheu_pesquisa",
        "entrou_grupo",
        "agente_liberado",
        "recebeu_pv",
        "recebeu_analise",
      ];
      flags.forEach((flag) => {
        const val = searchParams.get(flag);
        if (val === "true") rpcParams[`p_${flag}`] = true;
      });

      const minTempo = searchParams.get("min_tempo");
      if (minTempo) rpcParams.p_min_tempo_assistido = Number(minTempo);

      const minPoints = searchParams.get("min_points");
      if (minPoints) rpcParams.p_min_points = Number(minPoints);

      const maxPoints = searchParams.get("max_points");
      if (maxPoints) rpcParams.p_max_points = Number(maxPoints);

      const { data } = await supabase.rpc("get_leads_by_campaign", rpcParams);
      const allLeads = (data ?? []) as LeadRow[];

      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `leads_${timestamp}`;

      if (format === "csv") {
        exportLeadsCSV(allLeads, `${filename}.csv`);
      } else {
        exportLeadsXLSX(allLeads, `${filename}.xlsx`);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Header>
        <CampaignSelector />
      </Header>

      <main className="p-4 sm:p-6 space-y-4">
        {/* Search + Filter bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-gray-50 border-gray-200 text-[13px] placeholder:text-gray-400 focus-visible:bg-white"
              />
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <LeadsFilters />
            <div className="h-6 w-px bg-gray-200" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={exporting || loading || totalCount === 0}
                  className="gap-2 h-9 text-[13px] border-gray-200"
                >
                  {exporting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("csv")} className="text-[13px]">
                  Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("xlsx")} className="text-[13px]">
                  Exportar Excel (.xlsx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-[13px] text-gray-500">
            <span className="font-semibold text-gray-700">
              {totalCount.toLocaleString("pt-BR")}
            </span>{" "}
            leads encontrados
          </p>
        )}

        {/* Desktop: Table */}
        <div className="hidden md:block">
          <LeadsTable
            data={leads}
            totalCount={totalCount}
            page={page}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>

        {/* Mobile: Cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-gray-100"
              />
            ))
          ) : leads.length > 0 ? (
            <>
              {leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {/* Mobile pagination */}
              <div className="flex items-center justify-between pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="h-8 text-[13px] border-gray-200"
                >
                  Anterior
                </Button>
                <span className="text-[13px] text-gray-500 tabular-nums">
                  {page} / {Math.ceil(totalCount / ITEMS_PER_PAGE) || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  className="h-8 text-[13px] border-gray-200"
                >
                  Próximo
                </Button>
              </div>
            </>
          ) : (
            <p className="text-center py-8 text-gray-400">
              Nenhum lead encontrado.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
