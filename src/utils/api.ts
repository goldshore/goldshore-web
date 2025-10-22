const defaultApiUrl = 'https://api.goldshore.org/v1';

const apiBase = import.meta.env.PUBLIC_API_URL || defaultApiUrl;

export { apiBase, defaultApiUrl };

export function resolveApiUrl(path: string): string {
  return new URL(path, apiBase).toString();
}
