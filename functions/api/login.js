import { createToken, sessionCookie, json } from '../_lib/auth.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "Admin non configuré (ADMIN_PASSWORD manquant)." }, 500);
  }
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const password = (body && body.password) || '';
  if (password !== env.ADMIN_PASSWORD) {
    return json({ ok: false, error: 'Mot de passe incorrect.' }, 401);
  }
  const token = await createToken(env.ADMIN_PASSWORD);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
}
