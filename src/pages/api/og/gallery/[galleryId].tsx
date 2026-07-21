import React from 'react';
import { NextApiRequest } from 'next';

import { fetchGraphql } from '../../../../fetch';
import { fcframeGalleryIdOpengraphQuery } from '../../../../queries/fcframeGalleryIdOpengraphQuery';
import { fallbackImageResponse } from '../../../../utils/fallback';
import { generateSplashImageResponse } from '../../../../utils/splashScreen';
import { getQueryParam } from '../../../../utils/request';
import { toNextApiHandler } from '../../../../utils/nextApiResponse';

const handler = async (req: NextApiRequest) => {
  try {
    const galleryId = getQueryParam(req, 'galleryId');

    if (!galleryId || typeof galleryId !== 'string') {
      return fallbackImageResponse();
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeGalleryIdOpengraphQuery,
      variables: { galleryId },
    });

    const { gallery } = queryResponse.data;
    if (gallery?.__typename !== 'Gallery') {
      return fallbackImageResponse();
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
  } catch {
    return fallbackImageResponse();
  }
};

export default toNextApiHandler(handler);
