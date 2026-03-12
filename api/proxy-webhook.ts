import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const WEBHOOK_URL = 'https://integrations.igreenenergy.io/webhook/ouvidoria';

  try {
    const res = await axios.post(WEBHOOK_URL, request.body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true
    });

    return response.status(res.status).send(res.data);
  } catch (error: any) {
    return response.status(500).json({ 
      error: 'Falha na conexão com o n8n no Vercel', 
      details: error.message 
    });
  }
}
