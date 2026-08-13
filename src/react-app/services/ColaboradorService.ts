export interface Colaborador {
  id?: number;
  nome: string;
  celular: string;
  idEmpresa: number;
  nomeEmpresa?: string;
  idCargo: number;
  nomeCargo?: string;
  idPermissao: number;
  nomePermissao?: string;
}

const API_URL = '/api/colaboradores';

export const ColaboradorService = {
  async listar(): Promise<Colaborador[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Falha ao carregar colaboradores');
    return res.json();
  },

  async salvar(colaborador: Colaborador): Promise<void> {
    const method = colaborador.id ? 'PUT' : 'POST';
    const url = colaborador.id ? `${API_URL}/${colaborador.id}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(colaborador),
    });

    if (!res.ok) throw new Error('Falha ao salvar colaborador');
  }
};