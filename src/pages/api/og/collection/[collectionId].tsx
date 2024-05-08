import React from 'react';
import { NextApiRequest } from 'next';

import { fetchGraphql } from '../../../../fetch';
import { fcframeCollectionIdOpengraphQuery } from '../../../../queries/fcframeCollectionIdOpengraphQuery';
import { fallbackImageResponse } from '../../../../utils/fallback';
import { generateSplashImageResponse } from '../../../../utils/splashScreen';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  try {
    const url = new URL(req.url ?? '');
    const collectionId = url.searchParams.get('collectionId');

    if (!collectionId || typeof collectionId !== 'string') {
      return fallbackImageResponse;
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeCollectionIdOpengraphQuery,
      variables: { collectionId: collectionId },
    });

    const { collection } = queryResponse.data;
    if (collection?.__typename !== 'Collection') {
      return fallbackImageResponse;
    }

    if (!collection?.tokens) {
      return fallbackImageResponse;
    }

    return generateSplashImageResponse({
      titleText: collection.name,
      numSplashImages: 5,
      tokens: collection.tokens.map((el) => el?.token),
      showUsername: true,
    });
  } catch (e) {
    console.error('error: ', e);
    return fallbackImageResponse;
  }
};

export default handler;
