export const galleryIdOpengraphQuery = `query GalleryIdOpengraphQuery($galleryId: DBID!) {
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
 }
`
