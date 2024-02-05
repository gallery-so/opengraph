export const fcframeCollectionIdOpengraphQuery = `
query fcframeCollectionIdOpengraphQuery($collectionId: DBID!) {
  collection: collectionById(id: $collectionId) {
    ... on ErrCollectionNotFound {
      __typename
    }
    ... on Collection {
      __typename

      tokens {
        token {
          dbid
          definition {
            name
            community {
              name
            }
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
              }
            }
          }
        }
      }
    }
  }
}
`;
