export interface Campaign {
  id: string;
  created_at: string;
  campaign_name: string | null;
  campaign_tag: string | null;
  aula_1: string | null;
  aula_2: string | null;
}

export interface Lead {
  id: string;
  campaign_id: string | null;
  contact_id: string | null;
  phone: string;
  name: string | null;
  email: string | null;
  ig_username: string | null;
  business_model: string | null;
  identity_role: string | null;
  revenue_range: string | null;
  ai_knowledge_level: string | null;
  pain_point: string | null;
  preencheu_pesquisa: boolean;
  entrou_grupo: boolean;
  recebeu_audio: boolean;
  agente_liberado: boolean;
  recebeu_pv_personalizada: boolean;
  recebeu_analise_insta: boolean;
  points: number;
  created_at: string;
  updated_at: string;
  last_interaction: string | null;
  lead_blocked: boolean | null;
  blocking_reason: string | null;
  status_compra: string | null;
  valor_total: number | null;
  forma_pagamento: string | null;
  nome_produto: string | null;
}

export interface LeadScore {
  id: string;
  phone: string;
  contact_id: string | null;
  campaign_id: string | null;
  lead_id: string | null;
  dimensao_f: number | null;
  dimensao_c: number | null;
  dimensao_e: number | null;
  dimensao_b: number | null;
  dimensao_t: number | null;
  dimensao_o: number | null;
  dna_code: string | null;
  score_propensao: number | null;
  temperatura: string | null;
  temperatura_score: number | null;
  faixa_faturamento: string | null;
  nivel_ia: string | null;
  pontos_engajamento: number | null;
  tempo_assistido_minutos: number | null;
}

/** Flat lead row returned by the RPC (lead + score + attendance aggregates) */
export interface LeadRow {
  id: string;
  campaign_id: string | null;
  contact_id: string | null;
  phone: string;
  name: string | null;
  email: string | null;
  ig_username: string | null;
  business_model: string | null;
  identity_role: string | null;
  revenue_range: string | null;
  preencheu_pesquisa: boolean;
  entrou_grupo: boolean;
  agente_liberado: boolean;
  recebeu_pv_personalizada: boolean;
  recebeu_analise_insta: boolean;
  points: number;
  last_interaction: string | null;
  lead_blocked: boolean | null;
  evento_compra: string | null;
  created_at: string;
  // From move_lead_scores
  temperatura: string | null;
  score_propensao: number | null;
  dna_code: string | null;
  faixa_faturamento: string | null;
  // Aggregated from move_webinar_attendance
  tempo_assistido_minutos: number | null;
  // From move_leads
  vai_participar: boolean | null;
}

export interface LeadFilters {
  campaign_id: string;
  search?: string;
  temperatura?: string[];
  revenue_range?: string[];
  evento_compra?: string[];
  preencheu_pesquisa?: boolean;
  entrou_grupo?: boolean;
  agente_liberado?: boolean;
  recebeu_pv?: boolean;
  recebeu_analise?: boolean;
  min_tempo_assistido?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}
