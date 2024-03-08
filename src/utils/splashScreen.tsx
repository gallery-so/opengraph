import React from 'react';
import { ImageResponse } from '@vercel/og';
import { getPreviewUrl } from '../fetch';
import { truncateAndStripMarkdown } from './extractWordsWithinLimit';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE, fallbackImageResponse } from './fallback';
import { alpinaLightItalic } from './fonts';

const CHAR_LENGTH_CENTER_TITLE = 36;
const calcLineHeightPx = (largeFont: boolean) => (largeFont ? 160 : 100);

type Position = { left: number; top: number };

type Dimensions = {
  width: number;
  height: number;
};

type BaseProps = {
  containerSize: Dimensions;
  textAreaBoundingBox: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
};

function pickRandomInt([first, second]: number[]): number {
  // The maximum is inclusive and the minimum is inclusive
  return Math.floor(Math.random() * (first - second + 1)) + second;
}

function generatePositionsForSplashImages({
  numElements,
  possibleElementSizes,
  containerSize,
  textAreaBoundingBox,
}: {
  numElements: number;
  possibleElementSizes: number[];
} & BaseProps) {
  console.log({ textAreaBoundingBox });

  const positions: ((Position & { containerHeight: number }) | null)[] = [];
  const maxAttempts = 1000;
  for (let i = 0; i < numElements; i++) {
    let newPosition;
    let attempts = 0;
    const dimensionToUse = pickRandomInt(possibleElementSizes);
    do {
      newPosition = calcRandomPosition({
        elementSize: {
          width: dimensionToUse,
          height: dimensionToUse,
        },
        containerSize,
        textAreaBoundingBox,
        existingPositions: positions,
      });

      attempts++;
      if (attempts >= maxAttempts) {
        console.error('Maximum attempts reached, could not find a position for this photo.');
        newPosition = null;
        break;
      }
    } while (!newPosition);

    positions.push({ ...newPosition, containerHeight: dimensionToUse });
  }

  return positions;
}

type PositionOrNull = Position | null;

export function calcRandomPosition({
  // the image we want to place
  elementSize,
  // the size of the entire container
  containerSize,
  // the area where the text goes
  textAreaBoundingBox,
  // the positions of existing images
  existingPositions,
}: BaseProps & {
  elementSize: Dimensions;
  existingPositions: PositionOrNull[];
}): PositionOrNull {
  let position: PositionOrNull = null;
  let isOverlapping;

  // check if the generated position overlaps with the text area or other photos
  function checkOverlap(pos: Position) {
    // safety padding
    const buffer = 20;
    if (
      pos.left < textAreaBoundingBox.right + buffer &&
      pos.left + elementSize.width > textAreaBoundingBox.left - buffer &&
      pos.top < textAreaBoundingBox.bottom + buffer &&
      pos.top + elementSize.height > textAreaBoundingBox.top - buffer
    ) {
      return true;
    }

    // check against other images
    for (const existingPosition of existingPositions) {
      if (
        existingPosition &&
        pos.left < existingPosition.left + elementSize.width + buffer &&
        pos.left + elementSize.width > existingPosition.left - buffer &&
        pos.top < existingPosition.top + elementSize.height + buffer &&
        pos.top + elementSize.height > existingPosition.top - buffer
      ) {
        return true;
      }
    }
    return false;
  }

  // try to find a non-overlapping position
  const maxAttempts = 1000;
  for (let i = 0; i < maxAttempts; i++) {
    position = {
      left: Math.floor(Math.random() * (containerSize.width - elementSize.width)),
      top: Math.floor(Math.random() * (containerSize.height - elementSize.height)),
    };

    isOverlapping = checkOverlap(position);

    if (!isOverlapping) {
      break;
    }
  }

  return isOverlapping ? null : position;
}

function getTitleFontSize(length: number) {
  switch (true) {
    case length > 22:
      return '66px';
    case length > 14:
      return '80px';
    case length > 8:
      return '90px';
    default:
      return '140px';
  }
}

export async function generateSplashImageResponse({
  titleText,
  numSplashImages: maxNumSplashImages,
  tokens,
}: {
  titleText: string;
  numSplashImages: number;
  tokens: { definition: { media: string } }[];
}) {
  const splashImageUrls = tokens.slice(0, maxNumSplashImages).map((token) => {
    return getPreviewUrl(token.definition.media);
  });
  const numSplashImages = splashImageUrls.length;

  const displayUsername = truncateAndStripMarkdown(titleText, CHAR_LENGTH_CENTER_TITLE);
  const longName = displayUsername.length > 8;

  const textHeight = calcLineHeightPx(!longName) * (longName ? 2 : 1);

  const distanceFromTop = longName ? 220 : 240;
  const distanceFromLeft = 340;
  const excessContainerSize = 120;
  const textLength = 510;

  const textAreaBoundingBox = {
    top: distanceFromTop,
    left: distanceFromLeft,
    bottom: distanceFromTop + textHeight,
    right: distanceFromLeft + textLength,
  };

  const positions = generatePositionsForSplashImages({
    numElements: numSplashImages,
    possibleElementSizes: [320, 200],
    containerSize: {
      width: WIDTH_OPENGRAPH_IMAGE + excessContainerSize,
      height: HEIGHT_OPENGRAPH_IMAGE + excessContainerSize,
    },
    textAreaBoundingBox,
  });

  const imagesToRender = positions.map((position, i) => {
    return { ...position, url: splashImageUrls[i] };
  });

  const alpinaLightItalicFontData = await alpinaLightItalic;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          className="rectangle"
          style={{
            position: 'absolute',
            top: textAreaBoundingBox.top,
            left: textAreaBoundingBox.left,
            width: textAreaBoundingBox.right - textAreaBoundingBox.left,
            height: textAreaBoundingBox.bottom - textAreaBoundingBox.top,
          }}
        />
        {imagesToRender.map(({ url, top, left, containerHeight }) => {
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              alt={url}
              src={url}
              style={{
                position: 'absolute',
                top,
                left,
                maxWidth: `${containerHeight}px`,
                maxHeight: `${containerHeight}px`,
                display: 'block',
                objectFit: 'contain',
              }}
              width={containerHeight}
            />
          );
        })}
        <p
          style={{
            fontFamily: "'GT Alpina'",
            fontSize: getTitleFontSize(titleText.length),
            fontStyle: 'italic',
            display: 'flex',
            justifyContent: 'center',
            width: '520px',
            margin: 0,
            textAlign: 'center',
            letterSpacing: '-0.8rem',
          }}
        >
          {displayUsername}
        </p>
      </div>
    ),
    {
      width: WIDTH_OPENGRAPH_IMAGE,
      height: HEIGHT_OPENGRAPH_IMAGE,
      fonts: [
        {
          name: 'GT Alpina',
          data: alpinaLightItalicFontData,
          style: 'italic',
          weight: 500,
        },
      ],
      headers: {
        'Cache-Control': 'public, immutable, no-transform, max-age=604800',
      },
    }
  );
}