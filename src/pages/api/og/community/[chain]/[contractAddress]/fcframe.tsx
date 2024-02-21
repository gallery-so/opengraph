/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { NextApiRequest } from 'next';
import {
  HEIGHT_OPENGRAPH_IMAGE,
  WIDTH_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../../../utils/fallback';
import { fetchGraphql, getPreviewUrl } from '../../../../../../fetch';
import {
  fcframeContractCommunityOpengraphQuery,
  fcframeContractCommunityDimensionsOpengraphQuery,
} from '../../../../../../queries/fcframeContractCommunityOpengraphQuery';
import { ImageResponse } from '@vercel/og';
import {
  ABCDiatypeBold,
  ABCDiatypeRegular,
  alpinaLight,
  alpinaLightItalic,
} from '../../../../../../utils/fonts';
import { framePostHandler } from '../../../../../../utils/framePostHandler';
import { getPreviewTokens } from '../../../../../../utils/getPreviewTokens';
import { truncateAndStripMarkdown } from '../../../../../../utils/extractWordsWithinLimit';
import { getFrameHtmlResponse } from '@coinbase/onchainkit';

export const config = {
  runtime: 'edge',
};

function isImageTall(aspectRatio) {
  return aspectRatio < 1;
}

const handler = async (req: NextApiRequest) => {
  // handle POST, where we should return `fcframe` og tags to render the next frame with appropriate buttons
  if (req.method === 'POST') {
    let squareAspectRatio = false;

    const { htmlObj, status, position } = await framePostHandler(req, 'Explore', squareAspectRatio);
    try {
      const url = new URL(req.url ?? '');

      const chain = url.searchParams.get('chain');
      const contractAddress = url.searchParams.get('contractAddress');

      if (!chain || typeof chain !== 'string') {
        return;
      }

      if (!contractAddress || typeof contractAddress !== 'string') {
        return;
      }
      const queryResponse = await fetchGraphql({
        queryText: fcframeContractCommunityDimensionsOpengraphQuery,
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
        return;
      }

      const { tokensForFrame: tokens } = community;

      const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

      const centerToken = tokensToDisplay?.current;
      const tokenAspectRatio = centerToken?.aspectRatio;
      squareAspectRatio = !isImageTall(tokenAspectRatio);
    } catch (e) {
      console.log('e', e);
      return;
    }
    htmlObj.image.aspectRatio = squareAspectRatio ? '1:1' : '1.91:1';
    const newHtml = getFrameHtmlResponse(htmlObj);
    return new Response(newHtml, status);
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
    const alpinaLightItalicFontData = await alpinaLightItalic;
    const alpinaLightFontData = await alpinaLight;

    const { name: communityName, tokensForFrame: tokens } = community;

    // if no position is explicitly provided, that means we should serve the splash image
    let showSplashScreen = !position;

    if (position) {
      const tokensLength = tokens.length ?? 0;
      const mainPosition = Number(position) % tokensLength;
      if (mainPosition === 0) {
        // we've wrapped around to the start again as position has been explicitly set to 0
        showSplashScreen = true;
      }
    }

    if (showSplashScreen) {
      const numSplashImages = 4;
      const splashImageUrls = tokens.slice(0, numSplashImages).map((token) => {
        return getPreviewUrl(token.definition.media);
      });

      // todo: approximate these positions based on estimated dimensions of rendered text
      const distanceFromTop = 240;
      const distanceFromLeft = 400;
      const textLength = 410;
      const textHeight = 160;
      const textAreaBoundingBox = {
        top: distanceFromTop,
        left: distanceFromLeft,
        bottom: distanceFromTop + textHeight,
        right: distanceFromLeft + textLength,
      };
      const excessContainerSize = 105;

      console.log(splashImageUrls);

      const renderedImageDimension = 300;

      const positions = generatePositionsForSplashImages({
        numElements: numSplashImages,
        elementSize: { width: renderedImageDimension, height: renderedImageDimension },
        containerSize: {
          width: WIDTH_OPENGRAPH_IMAGE + excessContainerSize,
          height: HEIGHT_OPENGRAPH_IMAGE + excessContainerSize,
        },
        textAreaBoundingBox,
      });

      const imagesToRender = positions.map((position, i) => {
        return { ...position, url: splashImageUrls[i] };
      });

      const displayCommunityName = truncateAndStripMarkdown(communityName, 7);

      console.log({ imagesToRender });

      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              backgroundColor: '#ffffff',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              className="rectangle"
              style={{
                position: 'absolute',
                top: textAreaBoundingBox.top,
                left: textAreaBoundingBox.left,
                width: textAreaBoundingBox.right - textAreaBoundingBox.left,
                height: textAreaBoundingBox.bottom - textAreaBoundingBox.top,
              }}
            />
            {imagesToRender.map(({ url, top, left }) => {
              return (
                <img
                  key={url}
                  alt={url}
                  src={url}
                  style={{
                    position: 'absolute',
                    top,
                    left,
                    maxWidth: `${renderedImageDimension}px`,
                    maxHeight: `${renderedImageDimension}px`,
                    display: 'block',
                    objectFit: 'contain',
                  }}
                  width={renderedImageDimension}
                />
              );
            })}
            <p
              style={{
                fontFamily: "'GT Alpina'",
                fontSize: '140px',
                fontStyle: 'italic',
                margin: 0,
              }}
            >
              {displayCommunityName}
            </p>
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
              data: alpinaLightItalicFontData,
              style: 'italic',
              weight: 500,
            },
          ],
        },
      );
    }

    if (!showSplashScreen) {
      const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);
      console.log('tokensToDisplay', tokensToDisplay);

      const leftToken = Number(position) !== 1 && tokensToDisplay?.left;
      const centerToken = tokensToDisplay?.current;
      const rightToken = tokensToDisplay?.right;

      console.log('leftToken', leftToken);
      console.log('centerToken', centerToken);
      console.log('rightToken', rightToken);

      return new ImageResponse(
        (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '100%',
              height: '100%',
              minHeight: 200,
              backgroundColor: '#ffffff',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                position: 'relative',
                marginLeft: '-25%',
                filter: 'blur(6px)',
                opacity: 0.26,
              }}
            >
              {leftToken ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <img
                    width="500"
                    src={leftToken?.src}
                    style={{
                      maxWidth: '500px',
                      maxHeight: '500px',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                    alt="left token"
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      filter: 'blur(2px)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'ABCDiatype-Regular'",
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        margin: 0,
                      }}
                    >
                      {leftToken?.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "'ABCDiatype-Bold'",
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        margin: 0,
                      }}
                    >
                      {leftToken?.ownerName}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',

                position: 'absolute',
                width: '100%',

                height: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <img
                  width="500"
                  src={centerToken?.src}
                  style={{
                    maxWidth: '500px',
                    maxHeight: '500px',
                    display: 'block',
                    objectFit: 'contain',
                  }}
                  alt="center token"
                />
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Regular'",
                      fontSize: '14px',
                      fontWeight: 'light',
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {centerToken?.name}
                  </p>
                  <p
                    style={{
                      fontFamily: "'ABCDiatype-Bold'",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '20px',
                      margin: 0,
                    }}
                  >
                    {centerToken?.ownerName}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                position: 'relative',
                marginRight: '-25%',
                filter: 'blur(6px)',
                opacity: 0.26,
              }}
            >
              {rightToken ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <img
                    width="500"
                    src={rightToken?.src}
                    style={{
                      maxWidth: '500px',
                      maxHeight: '500px',
                      display: 'block',
                      objectFit: 'contain',
                    }}
                    alt="right token"
                  />
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      filter: 'blur(2px)',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'ABCDiatype-Regular'",
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        margin: 0,
                      }}
                    >
                      {rightToken?.name}
                    </p>
                    <p
                      style={{
                        fontFamily: "'ABCDiatype-Bold'",
                        fontSize: '14px',
                        fontWeight: 400,
                        lineHeight: '20px',
                        margin: 0,
                      }}
                    >
                      {rightToken?.ownerName}
                    </p>
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
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;

type ImagePosition = { left: number; top: number };

function calcRandomPosition({
  // the image we want to place
  elementSize,
  // the size of the entire container
  containerSize,
  // the area where the text goes
  textAreaBoundingBox,
  // the positions of existing images
  existingPositions,
}): ImagePosition | null {
  let position;
  let isOverlapping;

  // check if the generated position overlaps with the text area or other photos
  function checkOverlap(pos) {
    // safety padding
    const buffer = 20;
    if (
      pos.left < textAreaBoundingBox.right + buffer &&
      pos.left + elementSize.width > textAreaBoundingBox.left - buffer &&
      pos.top < textAreaBoundingBox.bottom + buffer &&
      pos.top + elementSize.height > textAreaBoundingBox.top - buffer
    ) {
      return true;
    }

    // check against other images
    for (const existingPosition of existingPositions) {
      if (
        pos.left < existingPosition.left + elementSize.width + buffer &&
        pos.left + elementSize.width > existingPosition.left - buffer &&
        pos.top < existingPosition.top + elementSize.height + buffer &&
        pos.top + elementSize.height > existingPosition.top - buffer
      ) {
        return true;
      }
    }
    return false;
  }

  // try to find a non-overlapping position
  const maxAttempts = 1000;
  for (let i = 0; i < maxAttempts; i++) {
    position = {
      left: Math.floor(Math.random() * (containerSize.width - elementSize.width)),
      top: Math.floor(Math.random() * (containerSize.height - elementSize.height)),
    };

    isOverlapping = checkOverlap(position);

    if (!isOverlapping) {
      break;
    }
  }

  return isOverlapping ? null : position;
}

// TODOs:
// - art blocks / prohibition support *
// - correctly estimate rendered text dimensions ***
// might just make the community title be max-1-line-tall for now (i know we wanted to allow for 2 lines)
// - different aspect ratios (tall vs. flat)
// letting images get cropped off the sides (right now they’re forced to be contained within the frame
// - post request to flip through different tokens in that collection

function generatePositionsForSplashImages({
  numElements,
  elementSize,
  containerSize,
  textAreaBoundingBox,
}) {
  console.log({ textAreaBoundingBox });
  const positions: (ImagePosition | null)[] = [];
  const maxAttempts = 1000;
  for (let i = 0; i < numElements; i++) {
    let newPosition;
    let attempts = 0;
    do {
      newPosition = calcRandomPosition({
        elementSize,
        containerSize,
        textAreaBoundingBox,
        existingPositions: positions,
      });

      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Maximum attempts reached, could not find a position for this photo.');
        newPosition = null;
        break;
      }
    } while (!newPosition);

    positions.push(newPosition);
  }

  return positions;
}
