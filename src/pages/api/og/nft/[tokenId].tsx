/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { fetchGraphql, getPreviewUrl } from '../../../../fetch';
import { tokenIdOpengraphQuery } from '../../../../queries/tokenIdOpengraphQuery';
import { NextApiRequest } from 'next';
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../utils/fallback';
import { ABCDiatypeRegular, alpinaLight, alpinaLightItalic } from '../../../../utils/fonts';
import React from 'react';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  try {
    const url = new URL(req.url ?? '');
    const tokenId = url.searchParams.get('tokenId');

    if (!tokenId || typeof tokenId !== 'string') {
      return fallbackImageResponse;
    }

    const queryResponse = await fetchGraphql({
      queryText: tokenIdOpengraphQuery,
      variables: { tokenId: tokenId },
    });

    const { token } = queryResponse.data;
    if (token?.__typename !== 'Token') {
      return fallbackImageResponse;
    }

    const tokenImageUrl = getPreviewUrl(token.definition.media);
    const title = token.definition.name;
    const collectorsNoteText = token.collectorsNote;
    const description = token.definition.description ?? '';

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const alpinaLightFontData = await alpinaLight;
    const alpinaLightItalicFontData = await alpinaLightItalic;

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
                maxWidth: '330px',
                height: '265px',
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
      },
    );
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
