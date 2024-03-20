import React from 'react';
import { ImageResponse } from '@vercel/og';
import { getPreviewUrl } from '../fetch';
import { truncateAndStripMarkdown } from './extractWordsWithinLimit';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE, fallbackImageResponse } from './fallback';
import { alpinaLight, alpinaLightItalic } from './fonts';

const CHAR_LENGTH_CENTER_TITLE = 56;
const calcLineHeightPx = (largeFont: boolean) => (largeFont ? 160 : 100);

type Position = { left: number; top: number };

type Dimensions = {
  width: number;
  height: number;
};

type BaseProps = {
  showUsername?: boolean;
  containerSize: Dimensions;
  textAreaBoundingBox: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  usernameContainerSize?: Dimensions;
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
  usernameContainerSize,
}: {
  numElements: number;
  possibleElementSizes: number[];
} & BaseProps) {
  const positions: ((Position & { containerHeight: number }) | null)[] = [];
  const maxAttempts = 1000;
  for (let i = 0; i < numElements; i++) {
    let newPosition;
    let attempts = 0;
    let dimensionToUse = pickRandomInt(possibleElementSizes);
    do {
      // as we try more attempts, use a smaller size
      if (attempts > 400) {
        dimensionToUse = possibleElementSizes[1];
      } else if (attempts > 700) {
        dimensionToUse = possibleElementSizes[2];
      }

      newPosition = calcRandomPosition({
        elementSize: {
          width: dimensionToUse,
          height: dimensionToUse,
        },
        containerSize,
        textAreaBoundingBox,
        usernameContainerSize,
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
  //
  usernameContainerSize,
}: BaseProps & {
  elementSize: Dimensions;
  existingPositions: PositionOrNull[];
}): PositionOrNull {
  let position: PositionOrNull = null;
  let isOverlapping = false;

  // check if the generated position overlaps with the text area or other photos
  function checkOverlap(pos: Position) {
    let overlapTitleArea = false;
    // safety padding
    const buffer = 20;
    if (
      pos.left < textAreaBoundingBox.right + buffer &&
      pos.left + elementSize.width > textAreaBoundingBox.left - buffer &&
      pos.top < textAreaBoundingBox.bottom + buffer &&
      pos.top + elementSize.height > textAreaBoundingBox.top - buffer
    ) {
      overlapTitleArea = true;
    }

    let overlapsUsernameArea = false;
    if (usernameContainerSize) {
      const lowerBound = (containerSize.width - usernameContainerSize.width) / 2 - 110;
      const upperBound = (containerSize.width + usernameContainerSize.width) / 2 + 50;
      overlapsUsernameArea = false;
      if (pos.top > containerSize.height / 2) {
        if (pos.left < upperBound && pos.left > lowerBound) {
          overlapsUsernameArea = true;
        } else if (
          pos.left + elementSize.width < upperBound &&
          pos.left + elementSize.width > lowerBound
        ) {
          overlapsUsernameArea = true;
        } else if (pos.left < lowerBound && pos.left + elementSize.width > upperBound) {
          overlapsUsernameArea = true;
        }
      }
    }

    let overlapsWithOtherImages = false;
    // check against other images
    for (const existingPosition of existingPositions) {
      if (
        existingPosition &&
        pos.left < existingPosition.left + elementSize.width + buffer &&
        pos.left + elementSize.width > existingPosition.left - buffer &&
        pos.top < existingPosition.top + elementSize.height + buffer &&
        pos.top + elementSize.height > existingPosition.top - buffer
      ) {
        overlapsWithOtherImages = true;
      }
    }

    if (!(overlapTitleArea || overlapsUsernameArea || overlapsWithOtherImages)) {
      const lowerBound = (containerSize.width - usernameContainerSize.width) / 2 - 140;
      const upperBound = (containerSize.width + usernameContainerSize.width) / 2 - 90;
      console.log('pos.left', pos.left);
      console.log('pos.top', pos.top);
      console.log('upperBound', upperBound);
      console.log('lowerBound', lowerBound);
      console.log(' elementSize.width', elementSize.width);
    }
    return overlapTitleArea || overlapsUsernameArea || overlapsWithOtherImages;
  }

  // try to find a non-overlapping position
  const maxAttempts = 1000;
  for (let i = 0; i < maxAttempts; i++) {
    position = {
      left: Math.floor(Math.random() * (containerSize.width - elementSize.width)),
      top: Math.floor(Math.random() * (containerSize.height - elementSize.height)),
    };

    isOverlapping = checkOverlap(position);

    console.log('isOverlapping', isOverlapping);
    if (!isOverlapping) {
      break;
    }
  }

  return isOverlapping ? null : position;
}

function getFontSizeAndSpacing(length: number) {
  if (length > 22) {
    return {
      fontSize: '66px',
      letterSpacing: '-0.3rem',
    };
  }
  if (length > 14) {
    return {
      fontSize: '80px',
      letterSpacing: '-0.4rem',
    };
  }
  if (length > 8) {
    return {
      fontSize: '90px',
      letterSpacing: '-0.45rem',
    };
  }
  return {
    fontSize: '140px',
    letterSpacing: '-0.8rem',
  };
}

export async function generateSplashImageResponse({
  titleText,
  numSplashImages: maxNumSplashImages,
  tokens,
  showUsername = false,
}: {
  titleText: string;
  showUsername?: boolean;
  numSplashImages: number;
  tokens: { definition: { media: string }; owner: { username: string } }[];
}) {
  const splashImageUrls = tokens.slice(0, maxNumSplashImages).map((token) => {
    return getPreviewUrl(token.definition.media);
  });
  const ownerName = tokens[0]?.owner?.username;
  const numSplashImages = splashImageUrls.length;

  const displayedTitle =
    truncateAndStripMarkdown(titleText, CHAR_LENGTH_CENTER_TITLE) || 'Untitled';
  const longName = displayedTitle.length > 8;

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
  console.log('containerWidth', WIDTH_OPENGRAPH_IMAGE + excessContainerSize);
  console.log('containerHeight', HEIGHT_OPENGRAPH_IMAGE + excessContainerSize);

  const positions = generatePositionsForSplashImages({
    numElements: numSplashImages,
    possibleElementSizes: [360, 200, 170],
    containerSize: {
      width: WIDTH_OPENGRAPH_IMAGE + excessContainerSize,
      height: HEIGHT_OPENGRAPH_IMAGE + excessContainerSize,
    },
    usernameContainerSize: showUsername
      ? {
          width: 150,
          height: 48,
        }
      : null,
    textAreaBoundingBox,
  });

  const imagesToRender = positions.map((position, i) => {
    return { ...position, url: splashImageUrls[i] };
  });

  const alpinaLightFontData = await alpinaLight;
  const alpinaLightItalicFontData = await alpinaLightItalic;

  const { fontSize, letterSpacing } = getFontSizeAndSpacing(titleText.length);

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
        <div
          style={{
            display: 'flex',
            backgroundColor: 'transparent',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            width: '100%',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'GT Alpina Italic'",
                fontSize,
                maxWidth: '520px',
                letterSpacing,
                textAlign: 'center',
              }}
            >
              {displayedTitle}
            </p>
          </div>
          {showUsername && (
            <p
              style={{
                position: 'absolute',
                fontFamily: "'GT Alpina'",
                fontSize: '48px',
                fontStyle: 'normal',
                bottom: 7,
                textAlign: 'center',
              }}
            >
              {ownerName}
            </p>
          )}
        </div>
      </div>
    ),
    {
      width: WIDTH_OPENGRAPH_IMAGE,
      height: HEIGHT_OPENGRAPH_IMAGE,
      fonts: [
        {
          name: 'GT Alpina',
          data: alpinaLightFontData,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'GT Alpina Italic',
          data: alpinaLightItalicFontData,
          style: 'normal',
          weight: 500,
        },
      ],
      headers: {
        // 24 hours
        'Cache-Control': 'public, immutable, no-transform, max-age=86400',
      },
    },
  );
}
