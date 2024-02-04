/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { fetchGraphql, getPreviewUrls } from '../../../../fetch';
import { tokenIdOpengraphQuery } from '../../../../queries/tokenIdOpengraphQuery';
import { NextApiRequest } from 'next';
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackUrl,
} from '../../../../utils/fallback';
import {
  ABCDiatypeRegular,
  ABCDiatypeBold,
  alpinaLight,
  alpinaLightItalic,
} from '../../../../utils/fonts';
import React from 'react';

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
      }
    );
  }

  try {
    const path = req.url ?? '';

    const url = new URL(path, baseUrl);
    const tokenId = url.searchParams.get('tokenId');

    const queryResponse = await fetchGraphql({
      queryText: tokenIdOpengraphQuery,
      variables: { tokenId: tokenId ?? '' },
    });

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;
    const alpinaLightItalicFontData = await alpinaLightItalic;

    const { token } = queryResponse.data;
    if (!tokenId || !token) {
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
        }
      );
    }

    const result = getPreviewUrls(token.definition.media);

    if (!result?.large) {
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
        }
      );
    }

    const tokenImageUrl = result?.large ?? '';
    const title = token.definition.name;

    const collectorsNoteText = token.collectorsNote;
    const description = token.definition.description ?? '';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            minHeight: 200,
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
            <img
              src={tokenImageUrl}
              style={{
                maxWidth: '265px',
                maxHeight: '265px',
                display: 'block',
                objectFit: 'contain',
              }}
              alt="post"
            />
            {collectorsNoteText && (
              <p
                style={{
                  fontFamily: "'GT Alpina Italic'",
                  fontSize: '24px',
                  fontWeight: 400,
                  lineHeight: '24px',
                  margin: 0,
                }}
              >
                “{collectorsNoteText}”
              </p>
            )}
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
              {title}
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
          {
            name: 'GT Alpina Italic',
            data: alpinaLightItalicFontData,
            style: 'normal',
            weight: 500,
          },
        ],
      }
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
      }
    );
  }
};

export default handler;
