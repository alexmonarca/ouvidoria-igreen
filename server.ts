import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Proxy limpo e resetado
  app.post("/api/proxy-webhook", async (req, res) => {
    const WEBHOOK_URL = 'https://integrations.igreenenergy.io/webhook/ouvidoria';
    
    console.log(`[RESET] Tentando enviar para: ${WEBHOOK_URL}`);
    
    try {
      const response = await axios.post(WEBHOOK_URL, req.body, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000,
        validateStatus: () => true // Captura qualquer status (404, 500, etc) sem dar crash
      });

      console.log(`[RESET] n8n respondeu com Status: ${response.status}`);
      res.status(response.status).send(response.data);
    } catch (error: any) {
      console.error('[RESET] Erro na conexão:', error.message);
      res.status(500).json({ error: 'Falha na conexão com o n8n', details: error.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor resetado em http://localhost:${PORT}`);
  });
}

startServer();
