export interface Empresa { id: number; nome: string; }
export interface Cargo { id: number; nome: string; }
export interface Permissao { id: number; nome: string; }

interface ApiResponseBody<T> {
  body?: T;
  txMensagem?: string;
}

type OpcaoColaborador = Empresa | Cargo | Permissao;

const listarOpcoes = async <T extends OpcaoColaborador>(endpoint: string, descricao: string): Promise<T[]> => {
  const res = await fetch(endpoint);
  const texto = await res.text();
  let json: ApiResponseBody<unknown> | unknown = null;

  if (texto.trim()) {
    try {
      json = JSON.parse(texto) as ApiResponseBody<unknown>;
    } catch {
      throw new Error(`Resposta inválida ao carregar ${descricao}`);
    }
  }

  if (!res.ok) {
    const mensagem = json && typeof json === 'object' && 'txMensagem' in json
      ? String(json.txMensagem)
      : `Falha ao carregar ${descricao}`;
    throw new Error(mensagem);
  }

  const conteudo = json && typeof json === 'object' && 'body' in json
    ? (json as ApiResponseBody<unknown>).body
    : json;
  return Array.isArray(conteudo) ? conteudo as T[] : [];
};

export const OpcoesColaboradorService = {
  listarEmpresas: () => listarOpcoes<Empresa>('/api/empresas', 'empresas'),
  listarCargos: () => listarOpcoes<Cargo>('/api/cargos', 'cargos'),
  listarPermissoes: () => listarOpcoes<Permissao>('/api/permissoes', 'permissões'),
};
