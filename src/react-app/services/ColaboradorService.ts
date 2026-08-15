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

type ApiResponseBody<T> = {
  body?: T;
};

const lerJson = async (res: Response): Promise<unknown> => {
  const texto = await res.text();
  if (!texto.trim()) return null;

  try {
    return JSON.parse(texto) as unknown;
  } catch {
    throw new Error('Resposta inválida recebida do servidor');
  }
};

export const ColaboradorService = {
  async listar(): Promise<Colaborador[]> {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Falha ao carregar colaboradores');

    const json = await lerJson(res);
    const conteudo = json && typeof json === 'object' && 'body' in json
      ? (json as ApiResponseBody<unknown>).body
      : json;

    return Array.isArray(conteudo) ? conteudo as Colaborador[] : [];
  },

  async salvar(colaborador: Colaborador): Promise<void> {
    const method = colaborador.id ? 'PUT' : 'POST';
    const url = colaborador.id ? `${API_URL}/${colaborador.id}` : API_URL;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(colaborador),
    });

    if (!res.ok) {
      const json = await lerJson(res);
      const mensagem = json && typeof json === 'object' && 'txMensagem' in json
        ? String(json.txMensagem)
        : 'Falha ao salvar colaborador';
      throw new Error(mensagem);
    }
  }
};
