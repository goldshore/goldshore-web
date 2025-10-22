const defaultApiUrl = 'https://api.goldshore.org/v1';

const apiBase = import.meta.env.PUBLIC_API_URL || defaultApiUrl;
const normalizedApiBase = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;

export { apiBase, defaultApiUrl };

export function resolveApiUrl(path: string): string {
  return new URL(path, normalizedApiBase).toString();
}
