import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type WebResponseHandler = (req: NextApiRequest) => Response | Promise<Response>;

const FALLBACK_IMAGE_URL =
  'https://cdn.gallery.so/media/system/opengraph/gallery-full-logo.png';
const RENDER_TIMEOUT_MS = 45_000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('OpenGraph render timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function renderResponse(handler: WebResponseHandler, req: NextApiRequest) {
  const response = await handler(req);
  if (!response.ok) {
    throw new Error(`OpenGraph renderer returned ${response.status}`);
  }

  const body = await response.arrayBuffer();
  if (body.byteLength === 0) {
    throw new Error('OpenGraph renderer returned an empty response');
  }

  return { response, body };
}

async function sendFallbackImage(res: NextApiResponse) {
  const response = await withTimeout(fetch(FALLBACK_IMAGE_URL), 10_000);
  if (!response.ok) {
    throw new Error(`Fallback image returned ${response.status}`);
  }

  const body = await response.arrayBuffer();
  res.status(200);
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600');
  res.send(Buffer.from(body));
}

export function toNextApiHandler(handler: WebResponseHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { response, body } = await withTimeout(
        renderResponse(handler, req),
        RENDER_TIMEOUT_MS,
      );

      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      res.send(Buffer.from(body));
    } catch (error) {
      if (req.method === 'GET') {
        await sendFallbackImage(res);
        return;
      }

      throw error;
    }
  };
}
