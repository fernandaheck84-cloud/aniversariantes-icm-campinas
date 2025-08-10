
import { blobs } from '@netlify/blobs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const admin = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  if (!admin || admin !== process.env.ADMIN_KEY) return { statusCode: 401, body: 'Unauthorized' };
  let body; try{ body = JSON.parse(event.body || '{}'); }catch{ body = {}; }
  const pessoas = Array.isArray(body.pessoas) ? body.pessoas : null;
  if (!pessoas) return { statusCode: 400, body: 'Invalid body' };
  const store = blobs();
  await store.set('people.json', JSON.stringify({ pessoas }), { contentType: 'application/json' });
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
