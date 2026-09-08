import { join, resolve } from 'node:path';
import express, { type Request, type Response } from 'express';
import { env } from 'server/constants/env.ts';
import ts2jsRouter from 'server/utilities/ts2js.ts';

export const app = express();

app.use(express.json());

app.use('/assets', express.static(join(env.SRC_DIR, 'assets')));
app.use(['/client', '/common'], ts2jsRouter);

app.get('/', (req: Request, res: Response) => {
  res.sendFile(resolve('src/assets/index.html'));
});

app.get('/temp', (req: Request, res: Response) => {
  res.sendFile(resolve('src/assets/temp.html'));
});
