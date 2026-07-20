// Utilitaires d'authentification (session signée HMAC-SHA256)
const enc = new TextEncoder();
const WEEK = 60 * 60 * 24 * 7;

async function hmacHex(key, msg) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(msg));
  return [...new Uint8Array(sig)].map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

export async function createToken(secret) {
  const payload = btoa(JSON.stringify({ exp: Date.now() + WEEK * 1000 }));
  const sig = await hmacHex(secret, payload);
  return payload + '.' + sig;
}

export async function verifyToken(token, secret) {
  if (!token || token.indexOf('.') === -1 || !secret) return false;
  const parts = token.split('.');
  const expected = await hmacHex(secret, parts[0]);
  if (parts[1] !== expected) return false;
  try {
    const data = JSON.parse(atob(parts[0]));
    return typeof data.exp === 'number' && Date.now() < data.exp;
  } catch (e) { return false; }
}

export function getCookie(request, name) {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function isAuthed(context) {
  const token = getCookie(context.request, 'lr_session');
  return verifyToken(token, context.env.ADMIN_PASSWORD);
}

export function sessionCookie(token) {
  return 'lr_session=' + token + '; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=' + WEEK;
}

export function clearCookie() {
  return 'lr_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0';
}

export function json(data, status, extraHeaders) {
  const headers = Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extraHeaders || {});
  return new Response(JSON.stringify(data), { status: status || 200, headers: headers });
}
