import type { DiaSemanaDto, StatusVistoriaDto, ApartamentoVistoriaDto } from "@/shared/types";

const BASE_URL = "https://nordtoolbackend-develop.up.railway.app/api/v1/nord-tool";

export async function listarDiasSemana(): Promise<DiaSemanaDto[]> {
  const res = await fetch(`${BASE_URL}/diaSemana`);
  const json = await res.json();
  return json.body || [];
}

export async function listarStatusVistoria(): Promise<StatusVistoriaDto[]> {
  const res = await fetch(`${BASE_URL}/statusVistoria`);
  const json = await res.json();
  return json.body || [];
}

export const apartamentoVistoriaService = {
  listar: async (): Promise<ApartamentoVistoriaDto[]> => {
    const res = await fetch(`${BASE_URL}/apartamentoVistoria`);
    const json = await res.json();
    return json.body || [];
  },

  importar: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append("planilha", file);

    const res = await fetch(`${BASE_URL}/apartamentoVistoria/importar`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Falha ao subir a planilha");
    return await res.json();
  }
};