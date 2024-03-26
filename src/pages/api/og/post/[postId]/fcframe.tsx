/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { ImageResponse } from '@vercel/og';
import { fetchGraphql, getPreviewUrl } from '../../../../../fetch';
import { getTokenMintTarget } from '../../../../../utils/getTokenMintTarget';
import { FrameImageMetadata, FrameMetadataType, getFrameHtmlResponse } from '@coinbase/onchainkit';
import {
  WIDTH_OPENGRAPH_IMAGE,
  HEIGHT_OPENGRAPH_IMAGE,
  fallbackImageResponse,
} from '../../../../../utils/fallback';
import { ABCDiatypeRegular, ABCDiatypeBold, alpinaLight } from '../../../../../utils/fonts';
import {
  CHAR_LENGTH_ONE_LINE,
  truncateAndStripMarkdown,
} from '../../../../../utils/extractWordsWithinLimit';

import { postIdQuery } from '../../../../../queries/postIdOpengraphQuery';
import { NextApiRequest } from 'next';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  if (req.method === 'POST') {
    const url = new URL(req.url ?? '');
    const postId = url.searchParams.get('postId');

    if (!postId || typeof postId !== 'string') {
      return fallbackImageResponse;
    }
    console.log({ postId });

    const queryResponse = await fetchGraphql({
      queryText: postIdQuery,
      variables: { postId: postId },
    });

    console.log({ queryResponse });
    const { post } = queryResponse.data;

    if (post?.__typename === 'ErrPostNotFound') {
      throw new Error('Error: post not found');
    }

    let profileImageUrl = '';
    const { token: profileToken, profileImage } = post?.author?.profileImage ?? {};

    if (profileImage && profileImage.previewURLs?.medium) {
      profileImageUrl = profileImage.previewURLs.medium;
    }

    const profileMedia = profileToken?.definition?.media;
    if (!profileImageUrl && profileMedia) {
      profileImageUrl = getPreviewUrl(profileMedia);
    }

    const postToken = post.tokens?.[0];
    if (!postToken) {
      throw new Error('Error: post token not found');
    }

    const mintTarget = getTokenMintTarget(postToken);
    const frameButtons: FrameMetadataType['buttons'] = [];
    if (mintTarget) {
      frameButtons.push({ label: 'Mint', action: 'mint', target: mintTarget });
    }

    const headers = new Headers();
    headers.append('Content-Type', 'text/html');

    const image = url.toString();
    const postUrl = url.toString();

    const htmlConfig = {
      buttons: frameButtons.length ? frameButtons : null,
      image: {
        src: image,
        aspectRatio: '1.91:1',
      } as FrameImageMetadata,
      postUrl,
    };

    const html = getFrameHtmlResponse(htmlConfig);
    return new Response(html, {
      status: 200,
      headers,
    });
  }

  try {
    const url = new URL(req.url ?? '');
    const postId = url.searchParams.get('postId');

    if (!postId || typeof postId !== 'string') {
      return fallbackImageResponse;
    }
    console.log({ postId });

    const queryResponse = await fetchGraphql({
      queryText: postIdQuery,
      variables: { postId: postId },
    });

    console.log({ queryResponse });
    const { post } = queryResponse.data;

    if (post?.__typename === 'ErrPostNotFound') {
      return fallbackImageResponse;
    }

    const author = post.author;
    const firstLetter = author?.username?.substring(0, 1).toUpperCase() ?? '';

    let profileImageUrl = '';
    const { token: profileToken, profileImage } = post?.author?.profileImage ?? {};

    if (profileImage && profileImage.previewURLs?.medium) {
      profileImageUrl = profileImage.previewURLs.medium;
    }

    const profileMedia = profileToken?.definition?.media;
    if (!profileImageUrl && profileMedia) {
      profileImageUrl = getPreviewUrl(profileMedia);
    }

    const postToken = post.tokens?.[0];
    if (!postToken) {
      return fallbackImageResponse;
    }

    let postImageUrl = '';
    const { media: postMedia } = postToken?.definition;
    if (postMedia) {
      postImageUrl = getPreviewUrl(postMedia);
    }

    const ABCDiatypeRegularFontData = await ABCDiatypeRegular;
    const ABCDiatypeBoldFontData = await ABCDiatypeBold;
    const alpinaLightFontData = await alpinaLight;

    const caption = truncateAndStripMarkdown(post?.caption, CHAR_LENGTH_ONE_LINE);
    const captionPlaintext = caption?.length === 0 ? 'View this post on gallery.so' : caption;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            gap: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fff',
          }}
        >
          <svg
            style={{ width: '56.74px', height: '196px' }}
            viewBox="0 0 36 121"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M33.3845 120.5C-4.79681 97.5124 -11.3149 43.5986 19.4718 11.6054C22.5802 8.39033 25.9865 5.47922 29.6447 2.91146C30.5382 2.3054 32.4485 1.05912 33.3845 0.500008L35.0311 3.09922C16.1957 15.7113 4.47411 37.8411 4.63154 60.5C4.47411 83.159 16.1957 105.314 35.0311 117.901L33.3845 120.5Z"
              fill="#141414"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              gap: 67,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={postImageUrl}
              style={{
                maxWidth: '450px',
                height: '370px',
                display: 'block',
                objectFit: 'contain',
              }}
              alt="post"
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {profileImageUrl ? (
                  <img
                    width="48"
                    height="48"
                    src={profileImageUrl}
                    style={{
                      borderRadius: 30,
                    }}
                    alt="profile picture"
                  />
                ) : (
                  <div
                    style={{
                      height: 48,
                      width: 48,
                      fontSize: 28,
                      borderWidth: 1,
                      borderColor: 'black',
                      fontFamily: "'GT Alpina'",

                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '999999999px',
                    }}
                  >
                    {firstLetter}
                  </div>
                )}
                <h1
                  style={{
                    fontSize: '32px',
                    lineHeight: '36px',
                    fontFamily: "'ABCDiatype-Bold'",
                    letterSpacing: '-0.01em',
                    margin: '0',
                    paddingBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {author?.username}
                </h1>
              </div>
              <div
                style={{
                  display: 'flex',
                }}
              >
                <p
                  style={{
                    fontFamily: "'ABCDiatype-Regular'",
                    fontSize: '25px',
                    fontWeight: 400,
                    lineHeight: '32px',
                    overflow: 'hidden',
                    wordBreak: 'break-word',
                    maxWidth: '350px',
                    minWidth: '200px',
                    margin: 0,
                  }}
                >
                  {captionPlaintext}
                </p>
              </div>
            </div>
          </div>
          <svg
            style={{ width: '56.74px', height: '196px' }}
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
