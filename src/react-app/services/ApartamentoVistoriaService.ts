import type {
  ApartamentoVistoriaDto,
  ApartamentoVistoriaForm,
} from "@/shared/types";

const BASE_URL =
  "https://glorious-fiesta-7wj5gxggjwjhx95q-8081.app.github.dev/api/v1/nord-tool/apartamentoVistoria";

export const apartamentoVistoriaService = {
  /* =========================
     LISTAR
  ========================= */
  async listar(): Promise<ApartamentoVistoriaDto[]> {
    const res = await fetch(BASE_URL);

    if (!res.ok) {
      throw new Error("Erro ao listar apartamentos");
    }

    const json = await res.json();
    return json.body;
  },

  /* =========================
     CRIAR
  ========================= */
  async criar(data: ApartamentoVistoriaForm) {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Erro ao criar apartamento");
    }

    return res.json();
  },

  /* =========================
     EDITAR
  ========================= */
  async editar(data: ApartamentoVistoriaForm) {
    const res = await fetch(BASE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Erro ao editar apartamento");
    }

    return res.json();
  },

  /* =========================
     DELETAR
  ========================= */
  async deletar(id: number) {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Erro ao deletar apartamento");
    }
  },

  /* =========================
     IMPORTAR PLANILHA
  ========================= */
  async importar(file: File) {
    const formData = new FormData();
    formData.append("planilha", file);

    const res = await fetch(`${BASE_URL}/importar`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Erro ao importar planilha");
    }

    return res.json();
  },
};
