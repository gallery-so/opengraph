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

    // TODO(Rohan): remove these once we can support these assets
    // temp fix to get the WLTA winner gallery frames working
    const tempIgnoreTokensWithIds = [
      '2bT2G4iiB0LfMVZ6k3YfdiIs8sU',
      '2bT2FzE3iB59Zm5PTUTAhM9lor7',
      '2blxlBBmty8MFX3qLevWqOXorJX',
      '2bhcj7DcaxAROSHodJH99glBt17',
      '2cPoZ0hrNJbaiNsMOvLkeHrfIFc',
      '2bT2FzEWNvgShbVLFwWDMnZ36ud',
      '2cPoYvcYW2xsDoSHhJn9YoMFjY2',
    ];

    const tokens = gallery.collections
      .filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((el) => el?.token)
      .filter((token) => {
        return !tempIgnoreTokensWithIds.filter((tokenId) => token.dbid === tokenId).length;
      });

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
