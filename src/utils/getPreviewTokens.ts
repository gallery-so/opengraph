// this function will determine which subset of 3 tokens we should choose to display
// out of a broader collection of tokens. these tokens will generally be laid out in

import { getPreviewUrl } from '../fetch';

export const getPreviewTokens = (allTokens: any[], position: string | null) => {
  const tokens = allTokens.map((token) => {
    if (token) {
      const url = getPreviewUrl(token.definition.media);
      return {
        src: url,
        name: token.definition?.name,
        communityName: token.definition?.community?.name,
        ownerName: token.owner?.username,
        aspectRatio: token.definition?.media?.dimensions?.aspectRatio,
      };
    }
  });
  const tokensLength = tokens.length ?? 0;
  const carouselLength = tokensLength + 1;

  if (tokensLength === 1) {
    const current = tokens[0];
    return { left: null, current, right: null };
  }

  // if `position` isn't provided, it means we're at the beginning of the carousel,
  // and we're only displaying current + next
  if (!position) {
    const current = tokens[0];
    const right = tokens[1];
    return { left: null, current, right };
  }

  // handle tokensLength === 2 separately
  const mainPosition = Number(position) % carouselLength;
  if (tokensLength === 2) {
    if (mainPosition === 0) {
      const current = tokens[0];
      const right = tokens[1];
      return { left: null, current, right };
    } else if (mainPosition === 1) {
      const left = tokens[0];
      const current = tokens[1];
      return { left, current, right: null };
    }
  }

  // handle first position separately (left token will be null as splash screen comes before)
  if (mainPosition === 0) {
    const current = tokens[0];
    const right = tokens[1];
    return { left: null, current, right };
  }

  // for any other position:
  // `left` will safely never be a negative value since we handled the `mainPosition` 0 case above
  const left = tokens[mainPosition - 1];
  const current = tokens[mainPosition];
  const right = tokens[mainPosition + 1];

  // `right` may overflow beyond the length of the set if `current` is the last element.
  // handle last position separately (right token will be null as splash screen comes next)
  if (mainPosition === tokensLength - 1) {
    return { left, current, right: null };
  }

  return { left, current, right };
};
