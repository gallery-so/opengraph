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

    const tokens = gallery.collections
      .filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token);

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
        <div style={containerStyle}>
          <div style={blurredLeftSideImageStyle}>
            {leftToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img width="500" height="500" src={leftToken?.src} style={imageStyle} alt="post" />
                <div style={imageDescriptionStyle}>
                  <p style={textStyle}>{leftToken?.name}</p>
                  <p style={boldTextStyle}>{leftToken?.communityName}</p>
                </div>
              </div>
            ) : null}
          </div>
          <div style={centeredImageContainerStyle}>
            <div style={columnFlexStyle}>
              <img
                width="500"
                height="500"
                src={centerToken?.src}
                style={imageStyle as CSSProperties}
                alt="post"
              />
              <div style={columnAltFlexStyle}>
                <p style={textStyle}>{centerToken?.name}</p>
                <p style={boldTextStyle}>{centerToken?.communityName}</p>
              </div>
            </div>
          </div>

          <div style={blurredRightSideImageStyle}>
            {rightToken ? (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <img
                  width="500"
                  height="500"
                  src={rightToken?.src}
                  style={imageStyle as CSSProperties}
                  alt="post"
                />
                <div style={imageDescriptionStyle}>
                  <p style={textStyle}>{rightToken?.name}</p>
                  <p style={boldTextStyle}>{rightToken?.communityName}</p>
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
