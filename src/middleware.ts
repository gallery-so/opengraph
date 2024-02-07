import { NextRequest, NextResponse } from 'next/server';
import { extractBody } from './utils/extractBody';

export const config = {
  matcher: ['/api/og/:path*'],
};

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let frameProperties = {};

  if (request.method === 'POST' && request.nextUrl.pathname.includes('fcframe')) {
    const body = JSON.parse(await extractBody(request.body));
    console.log('frame post body', body);
    if (body.untrustedData) {
      frameProperties = {
        fid: body.untrustedData.fid,
        url: body.untrustedData.url,
        timestamp: body.untrustedData.timestamp,
        network: body.untrustedData.network,
        buttonIndex: body.untrustedData.buttonIndex,
        inputText: body.untrustedData.inputText,
        castIdFid: body.untrustedData.castId.fid,
        hash: body.untrustedData.castId.hash,
      };
    }
  }

  let headers: Record<string, string> = {};
  let entries = Array.from(request.headers.entries());
  entries.forEach(([key, value]) => {
    headers[key] = value;
  });

  // non-blocking async call
  mixpanelTrack({ path, properties: frameProperties, headers });

  // Rewrite to URL
  return NextResponse.rewrite(request.url);
}

type MixpanelTrackProps = {
  path: string;
  properties: Record<string, string>;
  headers: Record<string, string>;
};

async function mixpanelTrack({ path, headers, properties }: MixpanelTrackProps) {
  console.log({ path, headers, properties });

  const isFrameButtonClick = 'buttonIndex' in properties;

  const data = new URLSearchParams();
  data.append(
    'data',
    JSON.stringify({
      event: 'opengraph_preview',
      properties: {
        token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
        path,
        isFrameButtonClick,
        ...headers,
        ...properties,
      },
    })
  );

  const options = {
    method: 'POST',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  };

  await fetch('https://api.mixpanel.com/track', options)
    .then((response) => response.json())
    .catch((err) => console.log('error tracking event', err));
}
