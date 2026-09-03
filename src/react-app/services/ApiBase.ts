const DEFAULT_BACKEND_ROOT = 'https://nordtoolbackend-develop.up.railway.app';

export const normalizarRaizBackend = (valor: string): string =>
  valor
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api\/v1\/nord-tool$/i, '')
    .replace(/\/api$/i, '');

const configuredBase = (import.meta.env.VITE_API_URL as string | undefined)
  || (import.meta.env.DEV ? '' : DEFAULT_BACKEND_ROOT);

export const BACKEND_ROOT = normalizarRaizBackend(configuredBase);
export const API_BASE = `${BACKEND_ROOT}/api`;
export const LEGACY_API_BASE = `${API_BASE}/v1/nord-tool`;
