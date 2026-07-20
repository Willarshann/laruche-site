import { isAuthed, json } from '../_lib/auth.js';

const MAX = 6 * 1024 * 1024; // 6 Mo (limite de valeur KV : 25 Mo)
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };

export async function onRequestPost(context) {
  if (!(await isAuthed(context))) {
    return json({ ok: false, error: 'Non autorisé.' }, 401);
  }

  let form;
  try { form = await context.request.formData(); }
  catch (e) { return json({ ok: false, error: 'Requête invalide.' }, 400); }

  const file = form.get('file');
  if (!file || typeof file === 'string') {
    return json({ ok: false, error: 'Aucun fichier reçu.' }, 400);
  }
  if (file.size > MAX) {
    return json({ ok: false, error: 'Image trop lourde (max 6 Mo).' }, 400);
  }
  if (file.type && ALLOWED.indexOf(file.type) === -1) {
    return json({ ok: false, error: 'Format non supporté (JPG, PNG, WebP, AVIF, GIF).' }, 400);
  }

  const ext = EXT[file.type] || 'jpg';
  const key = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;

  await context.env.STORE.put(key, await file.arrayBuffer(), {
    metadata: { contentType: file.type || 'image/jpeg' }
  });

  return json({ ok: true, url: '/media/' + key });
}
