
import { blobs } from '@netlify/blobs';

export const handler = async (event) => {
  const admin = event.headers['x-admin-key'] || event.headers['X-Admin-Key'];
  if (!admin || admin !== process.env.ADMIN_KEY) return { statusCode: 401, body: 'Unauthorized' };
  const store = blobs();
  const data = (await store.get('people.json', { type: 'json' })) || { pessoas: [] };
  return { statusCode: 200, body: JSON.stringify(data) };
};
