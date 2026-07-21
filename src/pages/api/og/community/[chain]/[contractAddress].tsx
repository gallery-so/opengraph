/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { NextApiRequest } from 'next';
import { fallbackImageResponse } from '../../../../../utils/fallback';
import { fetchGraphql } from '../../../../../fetch';
import { fcframeContractCommunityOpengraphQuery } from '../../../../../queries/fcframeContractCommunityOpengraphQuery';
import { generateSplashImageResponse } from '../../../../../utils/splashScreen';
import { getQueryParam } from '../../../../../utils/request';
import { toNextApiHandler } from '../../../../../utils/nextApiResponse';

// TODO: art blocks / prohibition support
const handler = async (req: NextApiRequest) => {
  // handle GET, which should return the raw image for the frame
  try {
    const chain = getQueryParam(req, 'chain');
    const contractAddress = getQueryParam(req, 'contractAddress');

    if (!chain || typeof chain !== 'string') {
      return fallbackImageResponse();
    }

    if (!contractAddress || typeof contractAddress !== 'string') {
      return fallbackImageResponse();
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
      return fallbackImageResponse();
    }

    const { name: communityName, tokensForFrame: tokens } = community;

    return generateSplashImageResponse({
      titleText: communityName,
      numSplashImages: 4,
      tokens,
    });
  } catch {
    return fallbackImageResponse();
  }
};

export default toNextApiHandler(handler);
