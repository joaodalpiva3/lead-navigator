"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Users,
  Flame,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Header } from "@/components/layout/header";
import { CampaignSelector } from "@/components/campaign-selector";
import { createClient } from "@/lib/supabase/client";

interface DashboardStats {
  total_leads: number;
  avg_points: number;
  engajados: number;
  temperatura: { temperatura: string; total: number }[];
  funnel: {
    total: number;
    preencheu_pesquisa: number;
    entrou_grupo: number;
    agente_liberado: number;
    recebeu_pv: number;
    recebeu_analise: number;
  };
  evento_compra: { evento: string; total: number }[];
  top_leads: {
    name: string;
    phone: string;
    points: number;
    score_propensao: number;
    temperatura: string;
  }[];
}

const TEMP_COLORS: Record<string, string> = {
  Fervendo: "#ef4444",
  Quente: "#f97316",
  Morno: "#eab308",
  Frio: "#3b82f6",
};

const EVENTO_COLORS: Record<string, string> = {
  "Compra Aprovada": "#22c55e",
  "Compra Reembolsada": "#ef4444",
  "Sem compra": "#d1d5db",
};

const TEMP_BADGE: Record<string, string> = {
  Fervendo: "bg-red-50 text-red-600",
  Quente: "bg-orange-50 text-orange-600",
  Morno: "bg-yellow-50 text-yellow-600",
  Frio: "bg-blue-50 text-blue-600",
};

const KPI_CONFIGS = [
  { color: "bg-blue-500", lightBg: "bg-blue-50", lightText: "text-blue-600" },
  { color: "bg-orange-500", lightBg: "bg-orange-50", lightText: "text-orange-600" },
  { color: "bg-emerald-500", lightBg: "bg-emerald-50", lightText: "text-emerald-600" },
  { color: "bg-violet-500", lightBg: "bg-violet-50", lightText: "text-violet-600" },
];

function KpiCard({
  title,
  value,
  icon: Icon,
  colorIndex,
  tooltip,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  colorIndex: number;
  tooltip?: string;
}) {
  const config = KPI_CONFIGS[colorIndex];
  return (
    <div className="relative group bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.lightBg}`}>
          <Icon className={`h-5 w-5 ${config.lightText}`} />
        </div>
      </div>
      {tooltip && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {tooltip}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

export function DashboardContent() {
  const searchParams = useSearchParams();
  const campaignParam = searchParams.get("campaign") || "";
  const campaignIds = campaignParam.split(",").filter(Boolean);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (campaignIds.length === 0) return;
    setLoading(true);

    const supabase = createClient();
    const { data } = await supabase.rpc("get_dashboard_stats", {
      p_campaign_ids: campaignIds,
    });

    if (data) {
      setStats(data as unknown as DashboardStats);
    }
    setLoading(false);
  }, [campaignParam]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const leadsQuentes =
    stats?.temperatura
      .filter((t) => t.temperatura === "Quente" || t.temperatura === "Fervendo")
      .reduce((sum, t) => sum + t.total, 0) ?? 0;

  const taxaEngajamento =
    stats && stats.total_leads > 0
      ? ((stats.engajados / stats.total_leads) * 100).toFixed(1)
      : "0";

  // Funnel data for chart
  const funnelData = stats
    ? [
        { name: "Pesquisa", value: stats.funnel.preencheu_pesquisa },
        { name: "Grupo", value: stats.funnel.entrou_grupo },
        { name: "Agente", value: stats.funnel.agente_liberado },
        { name: "PV", value: stats.funnel.recebeu_pv },
        { name: "Análise", value: stats.funnel.recebeu_analise },
      ]
    : [];

  // Evento compra for pie chart (exclude "Sem compra" for cleaner view)
  const eventoData = stats
    ? stats.evento_compra
        .filter((s) => s.evento !== "Sem compra")
        .map((s) => ({
          name: s.evento,
          value: s.total,
          color: EVENTO_COLORS[s.evento] || "#d1d5db",
        }))
    : [];

  const semCompra = stats?.evento_compra.find((s) => s.evento === "Sem compra")?.total ?? 0;

  return (
    <>
      <Header>
        <CampaignSelector />
      </Header>

      <main className="p-4 sm:p-6 space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          </div>
        ) : stats ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Total de Leads"
                value={stats.total_leads.toLocaleString("pt-BR")}
                icon={Users}
                colorIndex={0}
              />
              <KpiCard
                title="Leads Quentes"
                value={leadsQuentes.toLocaleString("pt-BR")}
                icon={Flame}
                colorIndex={1}
              />
              <KpiCard
                title="Taxa de Engajamento"
                value={`${taxaEngajamento}%`}
                icon={TrendingUp}
                colorIndex={2}
                tooltip="Leads que preencheram a pesquisa e entraram no grupo / Total de leads"
              />
              <KpiCard
                title="Pontuação Média"
                value={String(stats.avg_points ?? 0)}
                icon={Target}
                colorIndex={3}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Temperatura Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
                  Distribuição por Temperatura
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={stats.temperatura}
                    layout="vertical"
                    margin={{ left: 10, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <YAxis
                      type="category"
                      dataKey="temperatura"
                      width={80}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                      formatter={(value) => [
                        Number(value).toLocaleString("pt-BR"),
                        "Leads",
                      ]}
                    />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {stats.temperatura.map((entry) => (
                        <Cell
                          key={entry.temperatura}
                          fill={TEMP_COLORS[entry.temperatura] || "#d1d5db"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Funnel */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
                  Funil de Conversão
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={funnelData} margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                      formatter={(value) => [
                        Number(value).toLocaleString("pt-BR"),
                        "Leads",
                      ]}
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Evento Compra */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
                  Evento de Compra
                </h3>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={eventoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {eventoData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
                        formatter={(value) => [
                          Number(value).toLocaleString("pt-BR"),
                          "Leads",
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 text-[13px]">
                    {eventoData.map((s) => (
                      <div key={s.name} className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-gray-600">{s.name}</span>
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {s.value.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    ))}
                    {semCompra > 0 && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="h-2.5 w-2.5 rounded-full bg-gray-200" />
                        <span>Sem compra</span>
                        <span className="font-semibold tabular-nums">
                          {semCompra.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top Leads */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
                  Top 10 Leads por Score
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="text-left text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-2.5 font-semibold w-8">#</th>
                        <th className="pb-2.5 font-semibold">Nome</th>
                        <th className="pb-2.5 font-semibold text-center">Score</th>
                        <th className="pb-2.5 font-semibold text-center">Pts</th>
                        <th className="pb-2.5 font-semibold text-center">Temp.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.top_leads.map((lead, idx) => (
                        <tr
                          key={lead.phone}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-2.5 text-gray-300 font-medium tabular-nums">{idx + 1}</td>
                          <td className="py-2.5 font-medium text-gray-800 truncate max-w-[160px]">
                            {lead.name || "—"}
                          </td>
                          <td className="py-2.5 text-center font-semibold text-gray-900 tabular-nums">
                            {lead.score_propensao ?? "—"}
                          </td>
                          <td className="py-2.5 text-center text-gray-500 tabular-nums">
                            {lead.points}
                          </td>
                          <td className="py-2.5 text-center">
                            {lead.temperatura && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${TEMP_BADGE[lead.temperatura] || "bg-gray-100 text-gray-500"}`}
                              >
                                {lead.temperatura}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-20 text-gray-400">
            Selecione uma campanha para ver o dashboard.
          </div>
        )}
      </main>
    </>
  );
}
