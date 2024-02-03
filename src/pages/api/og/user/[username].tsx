import { ImageResponse } from '@vercel/og';
import { fetchGraphql, getPreviewUrls } from '../../../../fetch';
import { usernameOpengraphQuery } from '../../../../queries/usernameOpengraphQuery';
import { NextApiRequest } from 'next';

import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackUrl,
} from '../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../utils/fonts';

export const config = {
  runtime: 'edge',
};

let baseUrl = 'https://gallery.so';
let apiBaseUrl = 'https://gallery-opengraph.vercel.app';

// can manually set the preview URL via environment variables on vercel for the `opengraph` service
if (process.env.NEXT_PUBLIC_PREVIEW_URL) {
  baseUrl = process.env.NEXT_PUBLIC_PREVIEW_URL;
  apiBaseUrl = 'https://gallery-opengraph-preview.vercel.app';
} else if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
  baseUrl = 'https://gallery-dev.vercel.app';
  apiBaseUrl = 'https://gallery-opengraph-preview.vercel.app';
}

const handler = async (req: NextApiRequest) => {
  if (req.method === 'POST') {
    const urlPath = req.url ?? '';

    const url = new URL(urlPath, apiBaseUrl);
    const position = url.searchParams.get('position');
    const apiUrl = new URL(req.url ?? '', apiBaseUrl);

    console.log('body', req.body);
    const buttonIndex = req.body.untrustedData?.buttonIndex ?? req.body.option;

    console.log({ position, buttonIndex });

    let hasPrevious = true;

    // when user interacts with initial frame, no position param exists. we can therefore assume
    // they've clicked `next` since it'll be the only available option
    if (!position) {
      // set the position for the next token
      apiUrl.searchParams.set('position', '1');
      // for all other tokens, parse which button was clicked. button index of 1 means previous, 2 means next.
    } else if (buttonIndex) {
      if (Number(position) === 1) {
        // if we're on the second token and the user clicks `prev`, we should bump the user back to the first token
        // by deleting the position param so that they won't see a `prev` arrow
        if (Number(buttonIndex) === 1) {
          hasPrevious = false;
          apiUrl.searchParams.delete('position');
        }
      } else {
        // if we're further along in the collection, clicking `prev` should decrement the position
        if (Number(buttonIndex) === 1) {
          apiUrl.searchParams.set('position', `${Number(position) - 1}`);
        }
      }

      // if the user clicks `next`, we should always increment the position
      if (Number(buttonIndex) === 2) {
        apiUrl.searchParams.set('position', `${Number(position) + 1}`);
      }
    }

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'text/html');

    return new Response(
      `
      <html>
        <meta property="fc:frame" content="vNext">
        ${hasPrevious ? '<meta property="fc:frame:button:1" content="←">' : ''}
        <meta property="fc:frame:button:${hasPrevious ? 2 : 1}" content="→">
        <meta property="fc:frame:image" content="${apiUrl}">
        <meta property="fc:frame:post_url" content="${apiUrl}">
        <body>gm</body>
      </html>
    `,
      {
        status: 200,
        headers: myHeaders,
      },
    );
  }
  try {
    const path = req.url ?? '';

    const url = new URL(path, baseUrl);
    const username = url.searchParams.get('username');

    const queryResponse = await fetchGraphql({
      queryText: usernameOpengraphQuery,
      variables: { username: username ?? '' },
    });

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const { user } = queryResponse.data;
    if (!user) {
      return new ImageResponse(
        (
          <img
            src={fallbackUrl}
            style={{
              width: 1200,
              height: 630,
              display: 'block',
              objectFit: 'contain',
            }}
            alt="post"
          />
        ),
        {
          width: WIDTH_OPENGRAPH_IMAGE,
          height: HEIGHT_OPENGRAPH_IMAGE,
        },
      );
    }
    const description = user.bio.split('\n')[0];
    const nonEmptyGalleries = user.galleries?.filter((gallery) =>
      gallery?.collections?.some((collection) => collection?.tokens?.length),
    );

    const imageUrls = nonEmptyGalleries?.[0]?.collections
      ?.filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((galleryToken) => {
        //console.log("token", galleryToken?.token);
        //console.log("previewUrls", getPreviewUrls(galleryToken.token.definition.media));
        return galleryToken?.token ? getPreviewUrls(galleryToken.token.definition.media) : null;
      })
      .map((result) => {
        return result?.large ?? '';
      })
      .slice(0, 4);
    console.log('imageUrls', imageUrls);

    if (!username || !queryResponse?.data?.user) {
      return new ImageResponse(
        (
          <img
            src={fallbackUrl}
            style={{
              width: 1200,
              height: 630,
              display: 'block',
              objectFit: 'contain',
            }}
            alt="post"
          />
        ),
        {
          width: WIDTH_OPENGRAPH_IMAGE,
          height: HEIGHT_OPENGRAPH_IMAGE,
        },
      );
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <svg
              style={{ width: '36px', height: '121px' }}
              width="40"
              height="121"
              viewBox="0 0 36 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91146C30.5382 2.3054 32.4485 1.05912 33.3845 0.500008L35.0311 3.09922C16.1957 15.7113 4.47411 37.8411 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
                fill="#141414"
              />
            </svg>
            {imageUrls.map((url) => {
              return url ? (
                <div style={{ display: 'flex', maxWidth: '190px' }} key={url ? url : '2'}>
                  <img
                    src={url}
                    style={{
                      maxWidth: '190px',
                      maxHeight: '190px',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                    alt="post"
                  />
                </div>
              ) : null;
            })}
            <svg
              style={{ width: '36px', height: '121px' }}
              width="20"
              height="194"
              viewBox="0 0 36 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.61129 0.500008C40.7972 23.4876 47.3153 77.4014 16.5284 109.395C13.4189 112.609 10.0126 115.52 6.35534 118.089C5.4576 118.695 3.55158 119.941 2.61555 120.5L0.968933 117.901C19.8045 105.289 31.5261 83.159 31.3687 60.5C31.5261 37.8411 19.8045 15.7113 0.968933 3.09922L2.61129 0.500008Z"
                fill="#141414"
              />
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              bottom: '24px',
              left: '24px',
            }}
          >
            <p
              style={{
                fontFamily: "'GT Alpina'",
                fontSize: '32px',
                fontWeight: 400,
                lineHeight: '36px',
                letterSpacing: '0px',
                margin: 0,
              }}
            >
              {username}
            </p>
            {description && (
              <p
                style={{
                  fontFamily: "'ABCDiatype-Regular'",
                  fontSize: '18px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  margin: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        fonts: [
          {
            name: 'ABCDiatype-Regular',
            data: ABCDiatypeRegularFontData,
            weight: 400,
          },
          {
            name: 'ABCDiatype-Bold',
            data: ABCDiatypeBoldFontData,
            weight: 700,
          },
          {
            name: 'GT Alpina',
            data: alpinaLightFontData,
            style: 'normal',
            weight: 500,
          },
        ],
      },
    );
  } catch (e) {
    console.log('error: ', e);
    return new ImageResponse(
      (
        <img
          src={fallbackUrl}
          style={{
            width: WIDTH_OPENGRAPH_IMAGE,
            height: HEIGHT_OPENGRAPH_IMAGE,
            display: 'block',
          }}
          alt="fallback"
        />
      ),
      {
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
      },
    );
  }
};

export default handler;
