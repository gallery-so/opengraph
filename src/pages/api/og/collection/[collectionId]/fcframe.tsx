import React from 'react';

/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { fetchGraphql } from '../../../../../fetch';
import { fcframeCollectionIdOpengraphQuery } from '../../../../../queries/fcframeCollectionIdOpengraphQuery';
import { NextApiRequest } from 'next';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../../utils/fonts';
import {
  HEIGHT_OPENGRAPH_IMAGE,
  WIDTH_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../../utils/fallback';
import { framePostHandler } from '../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../utils/getPreviewTokens';
import {
  generateSplashImageResponse,
  shouldShowSplashScreen,
} from '../../../../../utils/splashScreen';
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
    return framePostHandler({ req, frameType: 'CollectionFrame' });
  }

  // handle GET, which should return the raw image for the frame
  try {
    const url = new URL(req.url ?? '');
    const collectionId = url.searchParams.get('collectionId');
    const position = url.searchParams.get('position');

    if (!collectionId || typeof collectionId !== 'string') {
      return fallbackImageResponse;
    }

    console.log('fetching collection', collectionId);

    const queryResponse = await fetchGraphql({
      queryText: fcframeCollectionIdOpengraphQuery,
      variables: { collectionId },
    });

    const { collection } = queryResponse.data;

    if (collection?.__typename !== 'Collection') {
      return fallbackImageResponse;
    }

    let tokens = collection.tokens.map((el) => el?.token);
    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

    let showSplashScreen = shouldShowSplashScreen({ position, carouselLength: tokens?.length + 1 });
    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: collection.name,
        numSplashImages: 5,
        tokens: tokens,
        showUsername: true,
      });
    }

    const leftToken = tokensToDisplay?.left;
    const centerToken = tokensToDisplay?.current;
    const rightToken = tokensToDisplay?.right;

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    return new ImageResponse(
      (
        <div style={containerStyle}>
          <div style={blurredLeftSideImageStyle}>
            {leftToken ? (
              <div style={columnAltFlexStyle}>
                <img
                  width="500"
                  height="500"
                  src={leftToken?.src}
                  style={imageStyle}
                  alt="left token"
                />
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
                style={imageStyle}
                alt="center token"
              />
              <div style={columnAltFlexStyle}>
                <p style={textStyle}>{centerToken?.name}</p>
                <p style={boldTextStyle}>{centerToken?.communityName}</p>
              </div>
            </div>
          </div>

          <div style={blurredRightSideImageStyle}>
            {rightToken ? (
              <div style={columnAltFlexStyle}>
                <img
                  width="500"
                  height="500"
                  src={rightToken?.src}
                  style={imageStyle}
                  alt="right token"
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
