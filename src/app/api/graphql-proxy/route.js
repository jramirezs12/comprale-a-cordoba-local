import { env } from '../../../lib/env';

const LOGIN_OPERATIONS = ['generateCustomerToken', 'revokeCustomerToken'];

function isLoginOperation(body) {
  try {
    const query = body?.query || '';
    return LOGIN_OPERATIONS.some((op) => query.includes(op));
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, store, Store',
    },
  });
}

export async function POST(request) {
  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  try {
    const body = await request.json();
    const url = env.ALCARRITO_GRAPHQL_URL;

    // If a store is provided by the incoming request, it wins.
    // Otherwise use env. If neither is set, OMIT the header (staging/tests).
    const incomingStore = (request.headers.get('store') || request.headers.get('Store') || '').trim();
    const storeToSend = (incomingStore || env.ALCARRITO_STORE_CODE || '').trim();

    const forwardHeaders = {
      'Content-Type': 'application/json',
      ...(storeToSend ? { store: storeToSend } : {}),
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader && !isLoginOperation(body)) {
      forwardHeaders.Authorization = authHeader;
    }

    console.log('[graphql-proxy] -> upstream', {
      requestId,
      url,
      store: storeToSend || null,
      operationName: body?.operationName || null,
      hasVariables: Boolean(body?.variables),
      queryPreview: typeof body?.query === 'string' ? body.query.slice(0, 120) : null,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error('[graphql-proxy] upstream returned non-JSON', {
        requestId,
        status: response.status,
        textPreview: text.slice(0, 300),
      });
      return Response.json({ message: 'Upstream returned non-JSON', status: response.status }, { status: 502 });
    }

    if (!response.ok || data?.errors?.length) {
      console.error('[graphql-proxy] upstream error', {
        requestId,
        status: response.status,
        errors: data?.errors || null,
      });
    } else {
      console.log('[graphql-proxy] upstream ok', { requestId, status: response.status });
    }

    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('[graphql-proxy] error:', { requestId, error });
    return Response.json({ message: 'Proxy error' }, { status: 500 });
  }
}