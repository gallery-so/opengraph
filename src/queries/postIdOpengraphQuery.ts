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
                  media {
                    ... on AudioMedia {
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
                    ... on GltfMedia {
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
                    ... on HtmlMedia {
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
                    ... on GIFMedia {
                      __typename
                      staticPreviewURLs {
                        small
                        medium
                        large
                      }
                      previewURLs {
                        small
                        medium
                        large
                      }
                      fallbackMedia {
                        mediaURL
                      }
                    }
                    ... on JsonMedia {
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
                    ... on TextMedia {
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
                    ... on PdfMedia {
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
                    ... on UnknownMedia {
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
                    ... on InvalidMedia {
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
                    ... on SyncingMedia {
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
        caption
        tokens {
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
`;
