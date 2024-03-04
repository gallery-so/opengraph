import { NextApiRequest } from 'next';
import { extractBody } from './extractBody';
import { FrameButtonMetadata, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { fetchGraphql } from '../fetch';
import { fcframeContractCommunityDimensionsOpengraphQuery } from '../queries/fcframeContractCommunityOpengraphQuery';
import { fcframeUsernameOpengraphQuery } from '../queries/fcframeUsernameOpengraphQuery';
import { fcframeCollectionIdOpengraphQuery } from '../queries/fcframeCollectionIdOpengraphQuery';
import { fcframeGalleryIdOpengraphQuery } from '../queries/fcframeGalleryIdOpengraphQuery';
import { getPreviewTokens } from './getPreviewTokens';

export function isImageTall(aspectRatio: number): boolean {
  return aspectRatio <= 1;
}

type FrameType = 'CollectionFrame' | 'UserFrame' | 'CommunityFrame' | 'GalleryFrame' | null;
type AllowedAspectRatio = '1.91:1' | '1:1';

type FramePostHandlerProps = {
  req: NextApiRequest;
  frameType?: FrameType;
  initialButtonLabel?: string;
};

export async function framePostHandler({
  req,
  frameType,
  initialButtonLabel,
}: FramePostHandlerProps) {
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

  // we re-calculate the position to get the position used for the og image response
  position = url.searchParams.get('position');

  // use square aspect ratio for image if appropriate for collection token
  // TODO(rohan): similarly support it for other types of frames
  let squareAspectRatio = false;
  console.log('frameType', frameType);
  if (frameType === 'CommunityFrame' && position) {
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
  } else if (frameType === 'UserFrame' && position) {
    const username = url.searchParams.get('username');
    if (!username || typeof username !== 'string') {
      throw new Error('Error: username not found');
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeUsernameOpengraphQuery,
      variables: { username },
    });

    const { user } = queryResponse.data;

    if (user?.__typename !== 'GalleryUser') {
      throw new Error('Error: user not found');
    }
    const tokens = user.galleries
      ?.filter(
        (gallery: { collections: any[] }) =>
          gallery?.collections?.some(
            (collection: { tokens: string | any[] }) => collection?.tokens?.length,
          ),
      )?.[0]
      .collections?.filter((collection: { hidden: any }) => !collection?.hidden)
      .flatMap((collection: { tokens: any }) => collection?.tokens)
      .map((el: { token: any }) => el?.token);

    const tokensToDisplay = getPreviewTokens(tokens, position);
    const tokensLength = tokens.length ?? 0;
    const mainPosition = Number(position) % tokensLength;

    const centerToken = tokensToDisplay?.current;
    const tokenAspectRatio = centerToken?.aspectRatio;
    squareAspectRatio = isImageTall(tokenAspectRatio) && mainPosition !== 0;
  } else if (frameType === 'CollectionFrame' && position) {
    const collectionId = url.searchParams.get('collectionId');

    if (!collectionId || typeof collectionId !== 'string') {
      throw new Error('Error: collectionId not found');
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeCollectionIdOpengraphQuery,
      variables: { collectionId: collectionId },
    });

    const { collection } = queryResponse.data;
    if (collection?.__typename !== 'Collection') {
      throw new Error('Error: collection not found');
    }

    const tokens = collection.tokens.map((el: { token: any }) => el?.token);
    const tokensLength = tokens.length ?? 0;
    const tokensToDisplay = getPreviewTokens(tokens, position);
    const mainPosition = Number(position) % tokensLength;

    const centerToken = tokensToDisplay?.current;
    const tokenAspectRatio = centerToken?.aspectRatio;
    squareAspectRatio = isImageTall(tokenAspectRatio) && mainPosition !== 0;
  } else if (frameType === 'GalleryFrame' && position) {
    const galleryId = url.searchParams.get('galleryId');

    if (!galleryId || typeof galleryId !== 'string') {
      throw new Error('Error: galleryId not found');
    }

    const queryResponse = await fetchGraphql({
      queryText: fcframeGalleryIdOpengraphQuery,
      variables: { galleryId },
    });

    const { gallery } = queryResponse.data;

    if (!gallery || gallery?.__typename !== 'Gallery') {
      throw new Error('Error: gallery not found');
    }

    const tokens = gallery.collections
      .filter((collection: { hidden: any }) => !collection?.hidden)
      .flatMap((collection: { tokens: any }) => collection?.tokens)
      .map((el: { token: any }) => el?.token);

    const tokensToDisplay = getPreviewTokens(tokens, position);
    const tokensLength = tokens.length ?? 0;

    const mainPosition = Number(position) % tokensLength;
    const centerToken = tokensToDisplay?.current;
    const tokenAspectRatio = centerToken?.aspectRatio;

    squareAspectRatio = isImageTall(tokenAspectRatio) && mainPosition !== 0;
  }

  if (squareAspectRatio) {
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
