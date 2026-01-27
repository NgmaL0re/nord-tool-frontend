export interface Apartamento {
  id: number;
  dia_semana: string;
  data: string;
  horario: string;
  apartamento: string;
  vistoria: string | null;
  vistoria_data: string | null;
  status: 'liberado' | 'aprovado' | 'reprovado' | 'pendente' | 'agendado';
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  total_cadastrados: number;
  agendados: number;
  liberados: number;
  aprovados: number;
  reprovados: number;
  pendentes: number;
  nao_liberados: number;
}

export interface Configuracao {
  id: number;
  chave: string;
  valor: string;
  created_at: string;
  updated_at: string;
}
