export const tokenIdOpengraphQuery =  `query TokenIdOpengraphQuery($tokenId: DBID!) {
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
`
