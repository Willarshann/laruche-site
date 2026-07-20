import { isAuthed, json } from '../_lib/auth.js';

export async function onRequestGet(context) {
  return json({ authed: await isAuthed(context) });
}
