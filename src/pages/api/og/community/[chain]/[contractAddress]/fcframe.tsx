import React from 'react';

/* eslint-disable @next/next/no-img-element */
import { NextApiRequest } from 'next';
import {
  HEIGHT_OPENGRAPH_IMAGE,
  WIDTH_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../../../utils/fallback';
import { fetchGraphql } from '../../../../../../fetch';
import { fcframeContractCommunityOpengraphQuery } from '../../../../../../queries/fcframeContractCommunityOpengraphQuery';
import { ImageResponse } from '@vercel/og';
import { ABCDiatypeBold, ABCDiatypeRegular, alpinaLight } from '../../../../../../utils/fonts';
import { framePostHandler, isImageTall } from '../../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../../utils/getPreviewTokens';
import {
  generateSplashImageResponse,
  shouldShowSplashScreen,
} from '../../../../../../utils/splashScreen';

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
} from '../../../../../../styles';

export const config = {
  runtime: 'edge',
};

// TODO: art blocks / prohibition support
const handler = async (req: NextApiRequest) => {
  // handle POST, where we should return `fcframe` og tags to render the next frame with appropriate buttons
  if (req.method === 'POST') {
    return framePostHandler({
      req,
      frameType: 'CommunityFrame',
      initialButtonLabel: '→',
    });
  }

  // handle GET, which should return the raw image for the frame
  try {
    const url = new URL(req.url ?? '');
    const chain = url.searchParams.get('chain');
    const contractAddress = url.searchParams.get('contractAddress');
    const position = url.searchParams.get('position');

    if (!chain || typeof chain !== 'string') {
      return fallbackImageResponse;
    }

    if (!contractAddress || typeof contractAddress !== 'string') {
      return fallbackImageResponse;
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeContractCommunityOpengraphQuery,
      variables: {
        contractCommunityKey: {
          contract: {
            address: contractAddress,
            chain,
          },
        },
      },
    });

    const { community } = queryResponse.data;

    if (community?.__typename !== 'Community') {
      return fallbackImageResponse;
    }

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const { name: communityName, tokensForFrame: tokens } = community;

    let showSplashScreen = shouldShowSplashScreen({ position, carouselLength: tokens?.length + 1 });
    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: communityName,
        numSplashImages: 4,
        tokens,
      });
    }

    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

    const leftToken = Number(position) !== 1 && tokensToDisplay?.left;
    const centerToken = tokensToDisplay?.current;
    const rightToken = tokensToDisplay?.right;

    const tokenAspectRatio = centerToken?.aspectRatio;
    const squareAspectRatio = isImageTall(tokenAspectRatio);

    if (squareAspectRatio) {
      return new ImageResponse(
        (
          <div style={containerStyle}>
            <div style={blurredLeftSideImageStyle}>
              {leftToken ? (
                <div style={columnAltFlexStyle}>
                  <img src={leftToken?.src} style={imageStyle} alt="left token" />
                  <div style={imageDescriptionStyle}>
                    <p style={textStyle}>{leftToken?.name}</p>
                    <p style={boldTextStyle}>{leftToken?.ownerName}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div style={centeredImageContainerStyle}>
              <div style={columnFlexStyle}>
                <div style={columnAltFlexStyle}>
                  <img src={centerToken?.src} style={imageStyle} alt="center token" />
                  <div style={columnAltFlexStyle}>
                    <p style={textStyle}>{centerToken?.name}</p>
                    <p style={boldTextStyle}>{centerToken?.ownerName}</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={blurredRightSideImageStyle}>
              {rightToken ? (
                <div style={columnAltFlexStyle}>
                  <img src={rightToken?.src} style={imageStyle} alt="right token" />
                  <div style={imageDescriptionStyle}>
                    <p style={textStyle}>{rightToken?.name}</p>
                    <p style={boldTextStyle}>{rightToken?.ownerName}</p>
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
    }

    return new ImageResponse(
      (
        <div style={containerStyle}>
          <div style={blurredLeftSideImageStyle}>
            {leftToken ? (
              <div style={columnAltFlexStyle}>
                <img src={leftToken?.src} style={imageStyle} alt="left token" />
                <div style={imageDescriptionStyle}>
                  <p style={textStyle}>{leftToken?.name}</p>
                  <p style={boldTextStyle}>{leftToken?.ownerName}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div style={centeredImageContainerStyle}>
            <div style={columnFlexStyle}>
              <img src={centerToken?.src} style={imageStyle} alt="center token" />
              <div style={columnAltFlexStyle}>
                <p style={textStyle}>{centerToken?.name}</p>
                <p style={boldTextStyle}>{centerToken?.ownerName}</p>
              </div>
            </div>
          </div>

          <div style={blurredRightSideImageStyle}>
            {rightToken ? (
              <div style={columnAltFlexStyle}>
                <img src={rightToken?.src} style={imageStyle} alt="right token" />
                <div style={imageDescriptionStyle}>
                  <p style={textStyle}>{rightToken?.name}</p>
                  <p style={boldTextStyle}>{rightToken?.ownerName}</p>
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
