"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { TemperaturaBadge } from "./temperatura-badge";
import type { LeadRow } from "@/lib/supabase/types";

interface LeadCardProps {
  lead: LeadRow;
}

export function LeadCard({ lead }: LeadCardProps) {
  const router = useRouter();

  function copyToClipboard(text: string, label: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copiado!`);
    });
  }

  const steps = [
    { active: lead.vai_participar, label: "Conf.", tip: "Confirmou participação" },
    { active: lead.preencheu_pesquisa, label: "Pesq.", tip: "Preencheu pesquisa" },
    { active: lead.entrou_grupo, label: "Grupo", tip: "Entrou no grupo WhatsApp" },
    { active: lead.agente_liberado, label: "Agente", tip: "Agente IA liberado" },
    { active: lead.recebeu_pv_personalizada, label: "PV", tip: "Recebeu PV personalizada" },
    { active: lead.recebeu_analise_insta, label: "IG", tip: "Recebeu análise do Instagram" },
  ];

  return (
    <Card
      className="cursor-pointer hover:border-blue-200 hover:shadow-md transition-all shadow-sm border-gray-200"
      onClick={() => router.push(`/leads/${lead.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-gray-100 text-gray-500 text-[11px] font-semibold shrink-0">
              {(lead.name || "?").charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 text-[14px]">
              {lead.name || "Sem nome"}
            </span>
            {lead.lead_blocked && (
              <ShieldAlert className="h-3.5 w-3.5 text-red-400" />
            )}
          </div>
          <TemperaturaBadge temperatura={lead.temperatura} />
        </div>

        {/* Score + Points + Minutes */}
        <div className="flex items-center gap-2">
          {lead.score_propensao != null && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
              <span className="text-[11px] text-gray-400 uppercase font-medium">Score</span>
              <span className="text-[13px] font-semibold text-gray-700 tabular-nums">{Number(lead.score_propensao).toFixed(0)}</span>
            </div>
          )}
          {lead.points > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
              <span className="text-[11px] text-gray-400 uppercase font-medium">Pts</span>
              <span className="text-[13px] font-semibold text-gray-700 tabular-nums">{lead.points}</span>
            </div>
          )}
          {Number(lead.tempo_assistido_minutos) > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50">
              <span className="text-[11px] text-gray-400 uppercase font-medium">Tempo</span>
              <span className="text-[13px] font-semibold text-gray-700 tabular-nums">{lead.tempo_assistido_minutos}min</span>
            </div>
          )}
        </div>

        {/* Phone */}
        {lead.phone && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-mono text-gray-500 tabular-nums">{lead.phone}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => copyToClipboard(lead.phone, "Telefone", e)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Funil */}
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
      </CardContent>
    </Card>
  );
}
