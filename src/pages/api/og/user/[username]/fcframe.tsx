import React from 'react';

/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { fetchGraphql } from '../../../../../fetch';
import { NextApiRequest } from 'next';
import {
  HEIGHT_OPENGRAPH_IMAGE,
  WIDTH_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold } from '../../../../../utils/fonts';
import { framePostHandler } from '../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../utils/getPreviewTokens';
import { fcframeUsernameOpengraphQuery } from '../../../../../queries/fcframeUsernameOpengraphQuery';
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
    return framePostHandler({ req, frameType: 'UserFrame' });
  }

  // handle GET, which should return the raw image for the frame
  try {
    const url = new URL(req.url ?? '');
    const username = url.searchParams.get('username');
    const position = url.searchParams.get('position');

    if (!username || typeof username !== 'string') {
      return fallbackImageResponse;
    }

    console.log('fetching user', username);

    const queryResponse = await fetchGraphql({
      queryText: fcframeUsernameOpengraphQuery,
      variables: { username },
    });

    const { user } = queryResponse.data;

    if (user?.__typename !== 'GalleryUser') {
      return fallbackImageResponse;
    }

    const tokens = user.galleries
      ?.filter(
        (gallery) => gallery?.collections?.some((collection) => collection?.tokens?.length),
      )?.[0]
      .collections?.filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token);

    let showSplashScreen = shouldShowSplashScreen({ position, carouselLength: tokens?.length + 1 });
    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: username,
        numSplashImages: 5,
        tokens,
      });
    }

    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

    const leftToken = tokensToDisplay?.left;
    const centerToken = tokensToDisplay?.current;
    const rightToken = tokensToDisplay?.right;

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;

    return new ImageResponse(
      (
        <div style={containerStyle}>
          <div style={blurredLeftSideImageStyle}>
            {leftToken ? (
              <div style={columnAltFlexStyle}>
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
              <img width="500" height="500" src={centerToken?.src} style={imageStyle} alt="post" />
              <div style={columnAltFlexStyle}>
                <p style={textStyle}>{centerToken?.name}</p>
                <p style={boldTextStyle}>{centerToken?.communityName}</p>
              </div>
            </div>
          </div>

          <div style={blurredRightSideImageStyle}>
            {rightToken ? (
              <div style={columnAltFlexStyle}>
                <img width="500" height="500" src={rightToken?.src} style={imageStyle} alt="post" />
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
        ],
      },
    );
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
