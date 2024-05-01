/* eslint-disable @next/next/no-img-element */
import React, { CSSProperties } from 'react';
import { NextApiRequest } from 'next';
import { ImageResponse } from '@vercel/og';
import { fetchGraphql } from '../../../../../fetch';
import { fcframeGalleryIdOpengraphQuery } from '../../../../../queries/fcframeGalleryIdOpengraphQuery';
import {
  fallbackImageResponse,
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
} from '../../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../../utils/fonts';
import { framePostHandler } from '../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../utils/getPreviewTokens';
import { generateSplashImageResponse } from '../../../../../utils/splashScreen';
import {
  containerStyle,
  blurredLeftSideImageStyle,
  blurredRightSideImageStyle,
  centeredImageContainerStyle,
  imageDescriptionStyle,
  textStyle,
  boldTextStyle,
  imageStyle,
  columnFlexStyle,
  columnAltFlexStyle,
} from '../../../../../styles';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  // handle POST, where we should return `fcframe` og tags to render the next frame with appropriate buttons
  if (req.method === 'POST') {
    return framePostHandler({ req, frameType: 'GalleryFrame' });
  }

  // handle GET, which should return the raw image for the frame
  try {
    const url = new URL(req.url ?? '');
    const galleryId = url.searchParams.get('galleryId');
    const position = url.searchParams.get('position');

    if (!galleryId || typeof galleryId !== 'string') {
      return fallbackImageResponse;
    }

    console.log('fetching gallery', galleryId);

    const queryResponse = await fetchGraphql({
      queryText: fcframeGalleryIdOpengraphQuery,
      variables: { galleryId },
    });

    const { gallery } = queryResponse.data;

    if (!gallery || gallery?.__typename !== 'Gallery') {
      return fallbackImageResponse;
    }

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    // TODO(Rohan): remove these once we can support these assets
    // temp fix to get the WLTA winner gallery frames working
    const tempIgnoreTokensWithIds = new Set([
      '2bT2G4iiB0LfMVZ6k3YfdiIs8sU',
      '2bT2FzE3iB59Zm5PTUTAhM9lor7',
      '2blxlBBmty8MFX3qLevWqOXorJX',
      '2bhcj7DcaxAROSHodJH99glBt17',
      '2cPoZ0hrNJbaiNsMOvLkeHrfIFc',
      '2bT2FzEWNvgShbVLFwWDMnZ36ud',
      '2cPoYvcYW2xsDoSHhJn9YoMFjY2',
    ]);

    const tokens = gallery.collections
      .filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token)
      .filter((token) => !tempIgnoreTokensWithIds.has(token?.dbid));

    // if no position is explicitly provided, serve splash image
    let showSplashScreen = !position;

    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: gallery.name,
        numSplashImages: 5,
        tokens,
        showUsername: true,
      });
    }

    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);
    const leftToken = tokensToDisplay?.left;
    const centerToken = tokensToDisplay?.current;
    const rightToken = tokensToDisplay?.right;

    return new ImageResponse(
      (
        <div style={containerStyle as CSSProperties}>
          <div style={blurredLeftSideImageStyle as CSSProperties}>
            {leftToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  width="500"
                  height="500"
                  src={leftToken?.src}
                  style={imageStyle as CSSProperties}
                  alt="post"
                />
                <div style={imageDescriptionStyle as CSSProperties}>
                  <p style={textStyle as CSSProperties}>{leftToken?.name}</p>
                  <p style={boldTextStyle as CSSProperties}>{leftToken?.communityName}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div style={centeredImageContainerStyle as CSSProperties}>
            <div style={columnFlexStyle as CSSProperties}>
              <img
                width="500"
                height="500"
                src={centerToken?.src}
                style={imageStyle as CSSProperties}
                alt="post"
              />
              <div style={columnAltFlexStyle as CSSProperties}>
                <p style={textStyle}>{centerToken?.name}</p>
                <p style={boldTextStyle}>{centerToken?.communityName}</p>
              </div>
            </div>
          </div>

          <div style={blurredRightSideImageStyle as CSSProperties}>
            {rightToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  width="500"
                  height="500"
                  src={rightToken?.src}
                  style={imageStyle as CSSProperties}
                  alt="post"
                />
                <div style={imageDescriptionStyle as CSSProperties}>
                  <p style={textStyle as CSSProperties}>{rightToken?.name}</p>
                  <p style={boldTextStyle as CSSProperties}>{rightToken?.communityName}</p>
                </div>
              </div>
            ) : null}
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
