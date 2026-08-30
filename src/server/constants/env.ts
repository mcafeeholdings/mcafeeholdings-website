import { tmpdir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';
import { cwd } from 'node:process';
import { z } from 'zod';

const absoluteFolderPath = z
  .string()
  .min(1, 'Folder path is required')
  .refine(isAbsolute, 'Must be an absolute folder path');

export const env = z
  .object({
    APP_NAME: z.string().toLowerCase().default('mcaffee-web'),
    SRC_DIR: absoluteFolderPath.default(resolve(cwd(), 'src')),
    TMP_DIR: absoluteFolderPath.optional(),
    WEBSITE_PORT: z.coerce.number().int().default(15632),
  })
  .transform((env) => ({
    ...env,
    TMP_DIR: env.TMP_DIR ?? join(tmpdir(), env.APP_NAME, 'client-cache'),
  }))
  .parse(process.env);
