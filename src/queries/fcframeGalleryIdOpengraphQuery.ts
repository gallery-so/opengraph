import { contractAndTokenIdSubstring } from './_contractAndTokenIdSubstring';
import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const fcframeGalleryIdOpengraphQuery = `
  query fcframeGalleryIdOpengraphQuery($galleryId: DBID!) {
    gallery: galleryById(id: $galleryId) {
      ... on ErrGalleryNotFound {
        __typename
      }
      ... on Gallery {
        __typename
        name
        collections {
          hidden
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
  }
`;
