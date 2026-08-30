import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';
import { type NextFunction, type Request, type Response, Router } from 'express';
import { env } from 'server/constants/env.ts';

const router = Router();

/**
 * Ensure temp cache directory exists once at startup
 */
fs.mkdirSync(env.TMP_DIR, { recursive: true });
console.log(env.SRC_DIR);
console.log(env.TMP_DIR);

/**
 * Compile a TS file to JS and persist it to cache
 */
async function compileTsFile(srcPath: string, outPath: string): Promise<string> {
  const source = fs.readFileSync(srcPath, 'utf8');

  const { code } = await transform(source, {
    format: 'esm',
    loader: 'ts',
    target: 'es2020',
  });

  const outputText = code.replaceAll(
    /(?<=import(?:\s+(?:\*\s+as\s+)?[\w\d$_]+,?)?\s+(?:{[^{}]+}\s+)?from\s+['"])(?:([\w\d.\s/]+)\.[tj]s(on)?)/g,
    '/$1.js$2',
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, outputText, 'utf8');

  return outputText;
}

/**
 * Dev-only TS → JS middleware
 */
router.get('/*path', async (req: Request, res: Response, next: NextFunction) => {
  const { originalUrl: requestPath } = req;
  const ext = /(\.ts|(?<!\.\w+))$/gi;

  if (requestPath.match(ext)) {
    return res.redirect(requestPath.replace(ext, '.js'));
  }

  //   const { path: $pathParam } = params;
  //   const $pathParamArr = Array.isArray($pathParam) ? $pathParam : [$pathParam];
  //   const requestPath = path.join(...$pathParamArr);

  const srcPath = path.join(env.SRC_DIR, requestPath.replace(/\.js$/i, '.ts'));
  const outPath = path.join(env.TMP_DIR, requestPath);

  if (!fs.existsSync(srcPath)) return next();

  const srcMtime = fs.statSync(srcPath).mtimeMs;

  let shouldRebuild = true;

  if (fs.existsSync(outPath)) {
    const outMtime = fs.statSync(outPath).mtimeMs;
    shouldRebuild = srcMtime > outMtime;
  }

  if (shouldRebuild) await compileTsFile(srcPath, outPath);

  // res.setHeader('Cache-Control', 'public, max-age=604800')
  res.type('application/javascript');
  res.sendFile(outPath);
});

export default router;
