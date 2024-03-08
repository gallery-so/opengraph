import { contractAndTokenIdSubstring } from './_contractAndTokenIdSubstring';
import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const fcframeUsernameOpengraphQuery = `
  query fcframeUsernameOpengraphQuery($username: String!) {
    user: userByUsername(username: $username) {
      ... on ErrUserNotFound {
        __typename
      }
      ... on ErrInvalidInput {
        __typename
      }
      ... on GalleryUser {
        __typename
        username
        bio
        galleries {
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
  }
`;
