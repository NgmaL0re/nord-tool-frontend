import type {
  DiaSemanaDto,
  StatusVistoriaDto,
} from "@/shared/types";

const BASE_URL = "https://nordtoolbackend-develop.up.railway.app/api/v1/nord-tool";

/* =========================
   ENDPOINTS DE DOMINIO
========================= */

export async function listarDiasSemana(): Promise<DiaSemanaDto[]> {
  const res = await fetch(`${BASE_URL}/api/v1/nord-tool/diaSemana`);
  const json = await res.json();
  return json.body;
}

export async function listarStatusVistoria(): Promise<StatusVistoriaDto[]> {
  const res = await fetch(`${BASE_URL}/api/v1/nord-tool/statusVistoria`);
  const json = await res.json();
  return json.body;
}