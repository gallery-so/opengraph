import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const postIdQuery = `
  query PostIdOpengraphQuery($postId: DBID!) {
    post: postById(id: $postId) {
      ... on ErrPostNotFound {
        __typename
      }
      ... on Post {
        __typename
        author {
          username
          profileImage {
            ... on TokenProfileImage {
              token {
                dbid
                definition {
                  ${mediaQuerySubstring}
                }
              }
            }
            ... on EnsProfileImage {
              __typename
              profileImage {
                __typename
                previewURLs {
                  medium
                }
              }
            }
          }
        }
        caption
        tokens {
          dbid
          definition {
            ${mediaQuerySubstring}
          }
        }
      }
    }
  }
`;
