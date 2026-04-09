import * as XLSX from "xlsx";
import type { LeadRow } from "@/lib/supabase/types";

const COLUMNS = [
  { key: "name", header: "Nome" },
  { key: "phone", header: "Telefone" },
  { key: "email", header: "Email" },
  { key: "ig_username", header: "Instagram" },
  { key: "temperatura", header: "Temperatura" },
  { key: "score_propensao", header: "Score Propensão" },
  { key: "points", header: "Pontos" },
  { key: "tempo_assistido_minutos", header: "Tempo Assistido (min)" },
  { key: "revenue_range", header: "Faixa de Faturamento" },
  { key: "faixa_faturamento", header: "Faturamento (Score)" },
  { key: "evento_compra", header: "Evento de Compra" },
  { key: "vai_participar", header: "Vai Participar" },
  { key: "preencheu_pesquisa", header: "Pesquisa" },
  { key: "entrou_grupo", header: "Grupo WhatsApp" },
  { key: "agente_liberado", header: "Agente IA" },
  { key: "recebeu_pv_personalizada", header: "PV Personalizada" },
  { key: "recebeu_analise_insta", header: "Análise Instagram" },
  { key: "dna_code", header: "DNA Code" },
  { key: "created_at", header: "Criado em" },
] as const;

function formatValue(key: string, value: unknown): string | number {
  if (value == null) return "";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (key === "created_at") {
    return new Date(value as string).toLocaleDateString("pt-BR");
  }
  if (typeof value === "number") return value;
  return String(value);
}

function leadsToRows(leads: LeadRow[]) {
  return leads.map((lead) => {
    const row: Record<string, string | number> = {};
    for (const col of COLUMNS) {
      row[col.header] = formatValue(
        col.key,
        lead[col.key as keyof LeadRow]
      );
    }
    return row;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportLeadsCSV(leads: LeadRow[], filename = "leads.csv") {
  const rows = leadsToRows(leads);
  const ws = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  downloadBlob(blob, filename);
}

export function exportLeadsXLSX(leads: LeadRow[], filename = "leads.xlsx") {
  const rows = leadsToRows(leads);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename);
}
