import React from 'react';
import { ImageResponse } from 'workers-og';

export const WIDTH_OPENGRAPH_IMAGE = 1200;
export const HEIGHT_OPENGRAPH_IMAGE = 630;

const fallbackUrl =
  'https://cdn.gallery.so/media/system/opengraph/gallery-full-logo.png';

export const fallbackImageResponse = () => new ImageResponse(
  (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fallbackUrl}
      style={{
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        display: 'block',
      }}
      alt="fallback"
    />
  ),
  {
    width: WIDTH_OPENGRAPH_IMAGE,
    height: HEIGHT_OPENGRAPH_IMAGE,
  },
);
