import { createServer } from 'node:http';
import { app } from 'server/app.ts';
import { env } from 'server/constants/env.ts';

const server = createServer(app);

server.listen(env.WEBSITE_PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${env.WEBSITE_PORT}`);
});
