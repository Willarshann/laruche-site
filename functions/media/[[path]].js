// Sert les images stockées dans KV : /media/<clé>
export async function onRequestGet(context) {
  const { params, env } = context;
  const key = Array.isArray(params.path) ? params.path.join('/') : params.path;
  if (!key || key === 'content.json') {
    return new Response('Not found', { status: 404 });
  }
  const { value, metadata } = await env.STORE.getWithMetadata(key, { type: 'arrayBuffer' });
  if (!value) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(value, {
    headers: {
      'Content-Type': (metadata && metadata.contentType) || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  });
}
