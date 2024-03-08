import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const galleryIdOpengraphQuery = `
  query GalleryIdOpengraphQuery($galleryId: DBID!) {
    gallery: galleryById(id: $galleryId) {
      ... on ErrGalleryNotFound {
        __typename
      }
      ... on Gallery {
        __typename
        name
        description
        collections {
          hidden
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
  }
`;
