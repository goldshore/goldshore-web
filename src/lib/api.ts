const defaultApiUrl = 'https://api.goldshore.org/v1';

export function getApiBaseUrl(): string {
  const envValue = import.meta.env.PUBLIC_API_URL || defaultApiUrl;
  return envValue.replace(/\/$/, '');
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();

  if (!path) {
    return base;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export { defaultApiUrl };
