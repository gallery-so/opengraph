/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { NextApiRequest } from 'next';
import { fallbackImageResponse } from '../../../../../../utils/fallback';
import { fetchGraphql } from '../../../../../../fetch';
import { fcframeContractCommunityOpengraphQuery } from '../../../../../../queries/fcframeContractCommunityOpengraphQuery';
import { generateSplashImageResponse } from '../../../../../../utils/splashScreen';

export const config = {
  runtime: 'edge',
};

// TODO: art blocks / prohibition support
const handler = async (req: NextApiRequest) => {
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

    const { name: communityName, tokensForFrame: tokens } = community;

    return generateSplashImageResponse({
      titleText: communityName,
      numSplashImages: 4,
      tokens,
    });
  } catch (e) {
    console.log('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
