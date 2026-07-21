import type { NextApiRequest } from 'next';

export function getQueryParam(req: NextApiRequest, key: string): string | undefined {
  const value = req.query[key];
  return Array.isArray(value) ? value[0] : value;
}

export function getAbsoluteRequestUrl(req: NextApiRequest): URL {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const protocol = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) ?? 'https';
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) ?? req.headers.host;

  return new URL(req.url ?? '/', `${protocol}://${host ?? 'og.gallery.so'}`);
}
