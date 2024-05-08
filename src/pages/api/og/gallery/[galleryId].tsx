import React from 'react';
import { NextApiRequest } from 'next';

import { fetchGraphql } from '../../../../fetch';
import { fcframeGalleryIdOpengraphQuery } from '../../../../queries/fcframeGalleryIdOpengraphQuery';
import { fallbackImageResponse } from '../../../../utils/fallback';
import { generateSplashImageResponse } from '../../../../utils/splashScreen';

export const config = {
  runtime: 'edge',
};

const handler = async (req: NextApiRequest) => {
  try {
    const url = new URL(req.url ?? '');
    const galleryId = url.searchParams.get('galleryId');

    if (!galleryId || typeof galleryId !== 'string') {
      return fallbackImageResponse;
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeGalleryIdOpengraphQuery,
      variables: { galleryId },
    });

    const { gallery } = queryResponse.data;
    if (gallery?.__typename !== 'Gallery') {
      return fallbackImageResponse;
    }

    const tokens = gallery.collections
      .filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token);

    return generateSplashImageResponse({
      titleText: gallery.name,
      numSplashImages: 5,
      tokens,
      showUsername: true,
    });
  } catch (error) {
    console.log('error', error);
    return fallbackImageResponse;
  }
};

export default handler;
