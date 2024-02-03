import React from "react";
import { ImageResponse } from "@vercel/og";

export const WIDTH_OPENGRAPH_IMAGE = 1200;
export const HEIGHT_OPENGRAPH_IMAGE = 630;

export const fallbackUrl =
  "https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png";

export const fallbackImageResponse = new ImageResponse(
  (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fallbackUrl}
      style={{
        width: WIDTH_OPENGRAPH_IMAGE,
        height: HEIGHT_OPENGRAPH_IMAGE,
        display: "block",
        objectFit: "contain",
      }}
      alt="post"
    />
  ),
  {
    width: WIDTH_OPENGRAPH_IMAGE,
    height: HEIGHT_OPENGRAPH_IMAGE,
  }
);
