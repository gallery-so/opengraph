export const mediaQuerySubstring = `
  media {
    ... on AudioMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on GltfMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on HtmlMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on ImageMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on GIFMedia {
      __typename
      staticPreviewURLs {
        small
        medium
        large
      }
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on JsonMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on TextMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on PdfMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on UnknownMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on InvalidMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on SyncingMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
    ... on VideoMedia {
      __typename
      previewURLs {
        small
        medium
        large
      }
      fallbackMedia {
        mediaURL
      }
      dimensions {
        aspectRatio
      }
    }
  }
`;
