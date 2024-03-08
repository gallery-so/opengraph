/* eslint-disable @next/next/no-img-element */
import React from 'react';
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
import { generateSplashImageResponse } from '../../../../../../utils/splashScreen';

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
      initialButtonLabel: 'Explore',
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

    // if no position is explicitly provided, that means we should serve the splash image
    let showSplashScreen = !position;

    // if position is the end of the carousel, that means we should serve the splash image
    if (position) {
      const tokensLength = tokens.length ?? 0;
      const mainPosition = Number(position) % tokensLength;
      if (mainPosition === 0) {
        // we've wrapped around to the start again as position has been explicitly set to 0
        showSplashScreen = true;
      }
    }

    if (showSplashScreen) {
      return generateSplashImageResponse({
        titleText: communityName,
        numSplashImages: 4,
        tokens,
      });
    }

    if (!showSplashScreen) {
      const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);

      const leftToken = Number(position) !== 1 && tokensToDisplay?.left;
      const centerToken = tokensToDisplay?.current;
      const rightToken = tokensToDisplay?.right;

      const tokenAspectRatio = centerToken?.aspectRatio;
      const squareAspectRatio = isImageTall(tokenAspectRatio);

      if (squareAspectRatio) {
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
                gap: leftToken ? 460 : 800,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  marginLeft: '-65%',
                  filter: 'blur(6px)',
                  opacity: 0.26,
                }}
              >
                {leftToken ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <img
                      src={leftToken?.src}
                      style={{
                        maxWidth: '340px',
                        maxHeight: '380px',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                      alt="left token"
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: 8,
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
                    width: '100%',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <div
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  >
                    <img
                      src={centerToken?.src}
                      style={{
                        maxWidth: '380px',
                        maxHeight: '380px',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                      alt="center token"
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: 8,
                        alignItems: 'flex-start',
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
                          lineHeight: '18px',
                          margin: 0,
                        }}
                      >
                        {centerToken?.ownerName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  marginRight: '-65%',
                  filter: 'blur(6px)',
                  opacity: 0.26,
                }}
              >
                {rightToken ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '380px',
                    }}
                  >
                    <img
                      src={rightToken?.src}
                      style={{
                        maxWidth: '340px',
                        maxHeight: '380px',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                      alt="right token"
                    />
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginTop: 8,
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
            width: 500,
            height: 500,
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
          }
        );
      }

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
                    height="500"
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
                  height="500"
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
                    height="500"
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
        }
      );
    }
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
