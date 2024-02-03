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
