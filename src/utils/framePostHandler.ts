import { NextApiRequest } from 'next';
import { extractBody } from './extractBody';
import { FrameButtonMetadata, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { fetchGraphql } from '../fetch';
import { fcframeContractCommunityDimensionsOpengraphQuery } from '../queries/fcframeContractCommunityOpengraphQuery';
import { getPreviewTokens } from './getPreviewTokens';

export function isImageTall(aspectRatio: number): boolean {
  return aspectRatio <= 1;
}

type FrameSquareAspectRatioType = 'CollectionFrame' | null;
type AllowedAspectRatio = '1.91:1' | '1:1';

export async function framePostHandler(
  req: NextApiRequest,
  handleSquareAspectRatioType: FrameSquareAspectRatioType = null,
  initialButtonLabel?: string,
) {
  const url = new URL(req.url ?? '');
  let position = url.searchParams.get('position');
  const body = JSON.parse(await extractBody(req.body));
  const buttonIndex = body.untrustedData?.buttonIndex;

  console.log({ body, position, buttonIndex });

  let hasPrevious = true;
  let buttonContent = '→';

  // when user interacts with initial frame, no position param exists. we can therefore assume
  // they've clicked `next` since it'll be the only available option
  if (!position) {
    // set the position for the next token
    url.searchParams.set('position', '1');

    // for all other tokens:
    // buttonIndex=1 maps to previous
    // buttonIndex=2 maps to next
  } else if (buttonIndex) {
    // if we're on the second token and the user clicks `prev`, we should bump the user back to the first token
    // by deleting the position param so they won't see a `prev` arrow
    if (Number(position) === 1 && Number(buttonIndex) === 1) {
      hasPrevious = false;
      url.searchParams.delete('position');
      if (initialButtonLabel) {
        buttonContent = initialButtonLabel;
      }
    } else if (Number(buttonIndex) === 1) {
      // `prev` should decrement the position
      url.searchParams.set('position', `${Number(position) - 1}`);
    }

    // `next` should increment the position
    if (Number(buttonIndex) === 2) {
      // if the position is incremented beyond the length of the set, `getTokensDisplay` will
      // handle this edge case when the image is fetched
      url.searchParams.set('position', `${Number(position) + 1}`);
    }
  }

  const headers = new Headers();
  headers.append('Content-Type', 'text/html');

  const showTwoButtons = hasPrevious;
  const frameButtons: [FrameButtonMetadata, ...FrameButtonMetadata[]] = [
    { label: showTwoButtons ? '←' : buttonContent, action: 'post' },
    ...(showTwoButtons ? [{ label: buttonContent, action: 'post' } as FrameButtonMetadata] : []),
  ];
  const image = url.toString();
  const postUrl = url.toString();

  const htmlConfig = {
    buttons: frameButtons,
    image: {
      src: image,
      aspectRatio: '1.91:1' as AllowedAspectRatio,
    },
    postUrl,
  };

  position = url.searchParams.get('position');

  // use square aspect ratio for image if appropriate for collection token
  // TODO(rohan): similarly support it for other types of frames
  if (handleSquareAspectRatioType === 'CollectionFrame' && position) {
    let squareAspectRatio = false;

    const chain = url.searchParams.get('chain');
    const contractAddress = url.searchParams.get('contractAddress');

    if (!chain || typeof chain !== 'string') {
      throw new Error('Error: chain not found');
    }

    if (!contractAddress || typeof contractAddress !== 'string') {
      throw new Error('Error: contractAddress not found');
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeContractCommunityDimensionsOpengraphQuery,
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
      throw new Error('Error: community not found');
    }

    const { tokensForFrame: tokens } = community;
    const tokensToDisplay = getPreviewTokens(tokens, `${Number(position) - 1}`);
    const tokensLength = tokens.length ?? 0;
    const mainPosition = Number(position) % tokensLength;

    const centerToken = tokensToDisplay?.current;
    const tokenAspectRatio = centerToken?.aspectRatio;

    // if mainPosition is 0 we want to show splash screen in 1.91:1
    squareAspectRatio = isImageTall(tokenAspectRatio) && mainPosition !== 0;
    htmlConfig.image.aspectRatio = squareAspectRatio
      ? ('1:1' as AllowedAspectRatio)
      : ('1.91:1' as AllowedAspectRatio);
  }

  const html = getFrameHtmlResponse(htmlConfig);
  return new Response(html, {
    status: 200,
    headers,
  });
}
