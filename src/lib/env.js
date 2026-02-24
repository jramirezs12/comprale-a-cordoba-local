function readEnv(name, fallback) {
  return process.env[name] || fallback || '';
}

export const env = {
  ALCARRITO_GRAPHQL_URL:
    readEnv('ALCARRITO_GRAPHQL_URL') ||
    readEnv('NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL') ||
    'https://mcstaging.alcarrito.com/graphql',
  ALCARRITO_REST_BASE_URL:
    readEnv('ALCARRITO_REST_BASE_URL') ||
    readEnv('NEXT_PUBLIC_ALCARRITO_REST_BASE_URL') ||
    'https://mcstaging.alcarrito.com/rest/V1',
  ALCARRITO_STORE_CODE:
    readEnv('ALCARRITO_STORE_CODE') ||
    readEnv('NEXT_PUBLIC_ALCARRITO_STORE_CODE') ||
    'compraleacordoba',
};

export function graphqlUrl() {
  const url = env.ALCARRITO_GRAPHQL_URL;
  if (!url) throw new Error('ALCARRITO_GRAPHQL_URL is not configured');
  return url;
}

export function restUrl(path) {
  const base = env.ALCARRITO_REST_BASE_URL;
  if (!base) throw new Error('ALCARRITO_REST_BASE_URL is not configured');
  if (!path) return base;
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
