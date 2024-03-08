import { mediaQuerySubstring } from './_mediaQuerySubstring';

export const usernameOpengraphQuery = `
  query UsernameOpengraphQuery($username: String!) {
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
                  ${mediaQuerySubstring}
                }
              }
            }
          }
        }
      }
    }
  }
`;
