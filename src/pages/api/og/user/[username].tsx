/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { fetchGraphql, getPreviewUrl } from '../../../../fetch';
import { usernameOpengraphQuery } from '../../../../queries/usernameOpengraphQuery';
import { NextApiRequest } from 'next';

import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../utils/fonts';
import { removeMarkdownStyling } from '../../../../utils/removeMarkdownStyling';
import React from 'react';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  try {
    const url = new URL(req.url ?? '');
    const username = url.searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return fallbackImageResponse;
    }

    const queryResponse = await fetchGraphql({
      queryText: usernameOpengraphQuery,
      variables: { username: username },
    });

    const { user } = queryResponse.data;
    if (!user || user.__typename !== 'GalleryUser') {
      return fallbackImageResponse;
    }

    const description = removeMarkdownStyling(user.bio.split('\n')[0] ?? '');
    const nonEmptyGalleries = user.galleries?.filter(
      (gallery) => gallery?.collections?.some((collection) => collection?.tokens?.length),
    );

    const imageUrls = nonEmptyGalleries?.[0]?.collections
      ?.filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((galleryToken) => {
        return galleryToken?.token ? getPreviewUrl(galleryToken.token.definition.media) : null;
      })
      .slice(0, 4);

    if (!imageUrls) {
      return fallbackImageResponse;
    }

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

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
              gap: 25,
              alignItems: 'center',
              height: '100%',
            }}
          >
            <svg
              style={{ width: '36px', height: '121px' }}
              viewBox="0 0 36 121"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91146C30.5382 2.3054 32.4485 1.05912 33.3845 0.500008L35.0311 3.09922C16.1957 15.7113 4.47411 37.8411 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
                fill="#141414"
              />
            </svg>
            {imageUrls.map((url?: string) => {
              return url ? (
                <img
                  key={url}
                  src={url}
                  style={{
                    maxWidth: '250px',
                    height: '190px',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                  alt="collection token"
                />
              ) : null;
            })}
            <svg
              style={{ width: '36px', height: '121px' }}
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
    return fallbackImageResponse;
  }
};

export default handler;
