import { isAuthed, json } from '../_lib/auth.js';

const KEY = 'content.json';

// Lecture publique du contenu
export async function onRequestGet(context) {
  const text = (await context.env.STORE.get(KEY)) || '{}';
  return new Response(text, {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

// Écriture réservée à l'admin authentifié
export async function onRequestPut(context) {
  if (!(await isAuthed(context))) {
    return json({ ok: false, error: 'Non autorisé.' }, 401);
  }
  let body;
  try { body = await context.request.json(); }
  catch (e) { return json({ ok: false, error: 'JSON invalide.' }, 400); }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return json({ ok: false, error: 'Format attendu : objet.' }, 400);
  }
  if (body.products && !Array.isArray(body.products)) {
    return json({ ok: false, error: 'products doit être une liste.' }, 400);
  }
  if (body.mockups && !Array.isArray(body.mockups)) {
    return json({ ok: false, error: 'mockups doit être une liste.' }, 400);
  }

  await context.env.STORE.put(KEY, JSON.stringify(body));
  return json({ ok: true });
}
