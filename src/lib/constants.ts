export const ITEMS_PER_PAGE = 50;

export const TEMPERATURA_CONFIG = {
  Fervendo: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "flame",
  },
  Quente: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    icon: "flame",
  },
  Morno: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: null,
  },
  Frio: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    icon: null,
  },
} as const;

export type Temperatura = keyof typeof TEMPERATURA_CONFIG;

export const FUNNEL_FLAGS = [
  { key: "preencheu_pesquisa", label: "Pesquisa" },
  { key: "entrou_grupo", label: "Grupo" },
  { key: "agente_liberado", label: "Agente" },
  { key: "recebeu_pv_personalizada", label: "PV" },
  { key: "recebeu_analise_insta", label: "Análise IG" },
] as const;

export const REVENUE_RANGES = [
  "Até R$ 10 mil",
  "De R$ 10 mil a R$ 50 mil",
  "De R$ 50 mil a R$ 100 mil",
  "De R$ 100 mil a R$ 500 mil",
  "Acima de R$ 500 mil por mês",
] as const;

export const STATUS_COMPRA_OPTIONS = [
  { value: "APPROVED", label: "Aprovado" },
  { value: "PENDING", label: "Pendente" },
  { value: "REFUNDED", label: "Reembolsado" },
] as const;

export const SORT_OPTIONS = [
  { value: "score_propensao", label: "Score (maior)" },
  { value: "points", label: "Pontos (maior)" },
  { value: "tempo_assistido_minutos", label: "Tempo assistido (maior)" },
  { value: "last_interaction", label: "Última interação (recente)" },
  { value: "created_at", label: "Data cadastro (recente)" },
] as const;

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/leads", label: "Leads", icon: "Users" },
] as const;
