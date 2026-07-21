export const fetchGraphql = async ({
  queryText,
  variables,
}: {
  queryText: string;
  variables: Record<string, any>;
}) => {
  const response = await fetch('https://api.gallery.so/glry/graphql/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: queryText,
      variables,
    }),
  }).then((response) => response.json());

  return response;
};

type UrlSet = {
  small: string | null;
  medium: string | null;
  large: string | null;
};

export const getPreviewUrls = (media: any) => {
  let previewUrls: UrlSet | null = null;
  if (!media) {
    return previewUrls;
  }

  if (
    media &&
    'previewURLs' in media &&
    media.previewURLs &&
    (media.previewURLs.small || media.previewURLs.medium || media.previewURLs.large)
  ) {
    previewUrls = media.previewURLs;
  } else if (media && 'fallbackMedia' in media) {
    if (media.fallbackMedia?.mediaURL) {
      previewUrls = {
        small: media.fallbackMedia.mediaURL,
        medium: media.fallbackMedia.mediaURL,
        large: media.fallbackMedia.mediaURL,
      };
    }
  }
  return previewUrls;
};

export const getPreviewUrl = (media: any) => {
  const result = getPreviewUrls(media);
  return result?.large || result?.small || '';
};

export const getReachableImageUrls = async (urls: Array<string | null | undefined>, limit: number) => {
  const candidates = urls.filter((url): url is string => Boolean(url)).slice(0, limit * 3);
  const checkedUrls = await Promise.all(
    candidates.map(async (url) => {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok ? url : null;
      } catch {
        return null;
      }
    }),
  );

  return checkedUrls.filter((url): url is string => Boolean(url)).slice(0, limit);
};
