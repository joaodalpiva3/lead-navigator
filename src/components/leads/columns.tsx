"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, ShieldAlert, PhoneOff } from "lucide-react";
import { toast } from "sonner";
import { TemperaturaBadge } from "./temperatura-badge";
import type { LeadRow } from "@/lib/supabase/types";

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success(`${label} copiado!`);
  });
}

export const columns: ColumnDef<LeadRow>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold shrink-0">
            {(lead.name || "?").charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900 truncate max-w-[160px] text-[13px]">
            {lead.name || "Sem nome"}
          </span>
          {lead.lead_blocked && (
            <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Telefone",
    cell: ({ row }) => {
      const phone = row.original.phone;
      if (!phone) return <PhoneOff className="h-3.5 w-3.5 text-gray-300" />;
      return (
        <div className="flex items-center gap-1 group/phone">
          <span className="text-[13px] text-gray-600 font-mono tabular-nums">{phone}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 opacity-0 group-hover/phone:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(phone, "Telefone");
            }}
          >
            <Copy className="h-3 w-3 text-gray-400" />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Contato",
    cell: ({ row }) => {
      const email = row.original.email;
      const ig = row.original.ig_username;
      return (
        <div className="space-y-0.5">
          {email ? (
            <div className="flex items-center gap-1 group/email">
              <span className="text-[13px] text-gray-600 truncate max-w-[180px]">
                {email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover/email:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(email, "Email");
                }}
              >
                <Copy className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          ) : (
            <span className="text-gray-300 text-[13px]">—</span>
          )}
          {ig && (
            <div className="flex items-center gap-1 group/ig">
              <span className="text-[11px] text-gray-400">@{ig}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 opacity-0 group-hover/ig:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(ig, "Instagram");
                }}
              >
                <Copy className="h-2.5 w-2.5 text-gray-400" />
              </Button>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "temperatura",
    header: "Temp.",
    cell: ({ row }) => (
      <TemperaturaBadge temperatura={row.original.temperatura} />
    ),
  },
  {
    accessorKey: "score_propensao",
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.score_propensao;
      if (score == null) return <span className="text-gray-300">—</span>;
      const pct = Math.min(Number(score), 100);
      return (
        <div className="flex items-center gap-2">
          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#94a3b8",
              }}
            />
          </div>
          <span className="text-[13px] font-semibold text-gray-700 w-7 text-right tabular-nums">
            {Number(score).toFixed(0)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "points",
    header: "Pontos",
    cell: ({ row }) => {
      const pts = row.original.points;
      if (!pts) return <span className="text-gray-300 text-[13px]">0</span>;
      return <span className="text-[13px] font-semibold text-gray-700 tabular-nums">{pts}</span>;
    },
  },
  {
    accessorKey: "tempo_assistido_minutos",
    header: "Assistido",
    cell: ({ row }) => {
      const min = row.original.tempo_assistido_minutos;
      if (!min) return <span className="text-gray-300 text-[13px]">0min</span>;
      return (
        <span className="text-[13px] font-medium text-gray-600 tabular-nums">
          {min}<span className="text-gray-400">min</span>
        </span>
      );
    },
  },
  {
    id: "flags",
    header: "Funil",
    cell: ({ row }) => {
      const lead = row.original;
      const steps = [
        { active: lead.vai_participar, label: "Conf.", tip: "Confirmou participação" },
        { active: lead.preencheu_pesquisa, label: "Pesq.", tip: "Preencheu pesquisa" },
        { active: lead.entrou_grupo, label: "Grupo", tip: "Entrou no grupo WhatsApp" },
        { active: lead.agente_liberado, label: "Agente", tip: "Agente IA liberado" },
        { active: lead.recebeu_pv_personalizada, label: "PV", tip: "Recebeu PV personalizada" },
        { active: lead.recebeu_analise_insta, label: "IG", tip: "Recebeu análise do Instagram" },
      ];

      return (
        <TooltipProvider>
          <div className="flex items-center gap-0.5">
            {steps.map((s) => (
              <Tooltip key={s.label}>
                <TooltipTrigger asChild>
                  <span
                    className={`inline-flex items-center justify-center text-[10px] font-medium px-1.5 py-0.5 rounded cursor-default transition-colors ${
                      s.active
                        ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200/60"
                        : "bg-gray-50 text-gray-300"
                    }`}
                  >
                    {s.label}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  {s.tip}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      );
    },
  },
];
