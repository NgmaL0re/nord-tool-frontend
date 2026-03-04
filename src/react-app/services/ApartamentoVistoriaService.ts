import type {
  ApartamentoVistoriaDto,
  ApartamentoVistoriaForm,
} from "@/shared/types";

// Nick, a URL correta é a do seu backend no Railway, não a do Localhost do Vite!
const API_BASE = import.meta.env.VITE_API_URL || "https://nordtoolbackend-develop.up.railway.app/api/v1/nord-tool";
const BASE_URL = `${API_BASE}/apartamentoVistoria`;

export const apartamentoVistoriaService = {
  async listar(): Promise<ApartamentoVistoriaDto[]> {
    // Lugia: Fazendo um GET limpo sem headers pesados para evitar o erro 415
    const res = await fetch(BASE_URL);
    
    if (!res.ok) throw new Error(`Erro ao listar apartamentos: ${res.status}`);
    
    const json = await res.json();
    
    // Garantindo que retornamos o array, esteja ele no .body ou solto no json
    return json.body || json || [];
  },

  async criar(data: ApartamentoVistoriaForm) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao criar apartamento");
    return res.json();
  },

  async editar(data: ApartamentoVistoriaForm) {
    const res = await fetch(BASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Erro ao editar apartamento");
    return res.json();
  },

  async deletar(id: number) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao deletar apartamento");
  },

  async importar(file: File) {
    const formData = new FormData();
    formData.append("planilha", file);

    const res = await fetch(`${BASE_URL}/importar`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Erro ao importar planilha");
    return res.json();
  },
};