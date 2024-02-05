import { mediaQuerySubstring } from './mediaQuerySubstring';

export const collectionIdIdOpengraphQuery = `
  query CollectionIdOpengraphQuery($collectionId: DBID!) {
    collection: collectionById(id: $collectionId) {
      ... on ErrInvalidInput {
        __typename
      }
      ... on ErrCollectionNotFound {
        __typename
      }
      ... on Collection {
        __typename
        name
        collectorsNote

        tokens {
          token {
            dbid
            definition {
              ${mediaQuerySubstring}
            }
          }
        }
      }
    }
  }
`;
