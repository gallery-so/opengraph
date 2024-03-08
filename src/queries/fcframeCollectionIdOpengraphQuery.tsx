import { contractAndTokenIdSubstring } from './_contractAndTokenIdSubstring';
import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const fcframeCollectionIdOpengraphQuery = `
  query fcframeCollectionIdOpengraphQuery($collectionId: DBID!) {
    collection: collectionById(id: $collectionId) {
      ... on ErrCollectionNotFound {
        __typename
      }
      ... on Collection {
        __typename
        name
        tokens {
          token {
            dbid
            definition {
              name
              community {
                name
              }
              ${mediaQuerySubstring}
              ${contractAndTokenIdSubstring}
            }
          }
        }
      }
    }
  }
`;
