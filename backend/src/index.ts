import cors from '@fastify/cors';
import Fastify from 'fastify';

import { config } from './config';
import { registerRoutes } from './routes';

const app = Fastify({
  logger: true,
});

async function main() {
  await app.register(cors, {
    origin: true,
  });
  await registerRoutes(app);

  await app.listen({
    port: config.port,
    host: config.host,
  });
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, async () => {
    app.log.info({ signal }, 'Shutting down backend');
    await app.close();
    process.exit(0);
  });
}

void main().catch(async (error) => {
  app.log.error(error);
  process.exit(1);
});
