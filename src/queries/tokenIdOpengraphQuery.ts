import { mediaQuerySubstring } from './mediaQuerySubstring';

export const tokenIdOpengraphQuery = `query TokenIdOpengraphQuery($tokenId: DBID!) {
   token: tokenById(id: $tokenId) {
     ... on ErrTokenNotFound {
       __typename
     }
     ... on Token {
       __typename
       collectorsNote
       dbid
       definition {
         name
         description
         ${mediaQuerySubstring}
       }
     }
   }
 }
`;
