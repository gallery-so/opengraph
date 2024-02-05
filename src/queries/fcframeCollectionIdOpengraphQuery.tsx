import { mediaQuerySubstring } from './mediaQuerySubstring';

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
              ${mediaQuerySubstring}
            }
          }
        }
      }
    }
  }
`;
