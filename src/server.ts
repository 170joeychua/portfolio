import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import { createGzip } from 'node:zlib';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
app.disable('x-powered-by');
const angularApp = new AngularNodeAppEngine();
// TODO: Update when setting up vercel
const isVercelDeployment = Boolean(process.env['VERCEL']);
const shouldUseCustomMiddleware = !isVercelDeployment;

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://cdn.jsdelivr.net https://placehold.co https:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 120;
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length) {
    return forwarded[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function securityHeaders(_: Request, res: Response, next: NextFunction) {
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  );
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  next();
}

function gzipCompression(req: Request, res: Response, next: NextFunction) {
  const acceptEncoding = req.headers['accept-encoding'] ?? '';
  if (!req.method || req.method === 'HEAD' || !/\bgzip\b/.test(acceptEncoding)) {
    return next();
  }

  const gzip = createGzip();
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let finished = false;

  res.setHeader('Content-Encoding', 'gzip');
  res.setHeader('Vary', 'Accept-Encoding');
  res.removeHeader('Content-Length');

  gzip.on('data', (chunk) => {
    originalWrite(chunk);
  });

  gzip.on('end', () => {
    if (!finished) {
      finished = true;
      originalEnd();
    }
  });

  gzip.on('error', () => {
    if (!finished) {
      finished = true;
      res.removeHeader('Content-Encoding');
      res.removeHeader('Vary');
      originalEnd();
    }
  });

  const safeEncoding = (encoding?: BufferEncoding): BufferEncoding => encoding ?? 'utf8';

  res.write = function (
    this: Response,
    chunk: any,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void,
  ) {
    gzip.write(chunk, safeEncoding(encoding), (err?: Error | null) => {
      cb?.(err);
    });
    return true;
  } as typeof res.write;

  res.end = function (
    this: Response,
    chunk?: any,
    encoding?: BufferEncoding,
    cb?: (err?: Error | null) => void,
  ) {
    if (chunk) {
      gzip.end(chunk, safeEncoding(encoding), (err?: Error | null) => cb?.(err));
      return this;
    }
    gzip.end((err?: Error | null) => cb?.(err));
    return this;
  } as typeof res.end;

  res.once('close', () => gzip.destroy());
  return next();
}

function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimits.set(ip, { count: 1, resetAt });
    setTimeout(() => {
      const current = rateLimits.get(ip);
      if (current && current.resetAt <= resetAt) {
        rateLimits.delete(ip);
      }
    }, RATE_LIMIT_WINDOW_MS + 1_000);
    return next();
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests. Try again later.' });
    return;
  }

  entry.count += 1;
  return next();
}

/**
 * Express Rest API endpoints can be defined here.
 * Define endpoints.
 */

app.use(securityHeaders);
if (shouldUseCustomMiddleware) {
  app.use(rateLimiter);
  app.use(gzipCompression);
} else {
  // When running on Vercel, defer rate limiting and compression to the platform.
}

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
