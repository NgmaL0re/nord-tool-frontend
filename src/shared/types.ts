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

export interface ApartamentoVistoriaDto {
  idApartamentoVistoria: number;
  nmApartamentoVistoria: string;
  idDiaSemana: number;
  nmDiaSemana?: string;
  dtApartamentoVigente?: string;
  nmHorarioVistoria?: string;
  idStatusVistoria: number;
  nmStatusVistoria: string;
  inMarcarRevistoria?: boolean;
  txObservacaoRevistoria?: string;
  dtRevistoriaVigente?: string;
}

export interface ApartamentoVistoriaForm {
  idApartamentoVistoria?: number;
  nmApartamentoVistoria: string;
  idDiaSemana: number;
  dtApartamentoVigente?: string;
  nmHorarioVistoria?: string;
  idStatusVistoria: number;
  inMarcarRevistoria?: boolean;
  txObservacaoRevistoria?: string;
  dtRevistoriaVigente?: string;
}

export interface DiaSemanaDto {
  idDiaSemana: number;
  nmDiaSemana: string;
}

export interface StatusVistoriaDto {
  idStatusVistoria: number;
  nmStatusVistoria: string;
}
