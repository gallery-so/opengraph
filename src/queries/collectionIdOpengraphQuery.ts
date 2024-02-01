export const collectionIdIdOpengraphQuery = `query CollectionIdOpengraphQuery($collectionId: DBID!) {
    collection: collectionById(id: $collectionId) {
        ... on ErrCollectionNotFound {
            __typename
        }
        ... on Collection {
            __typename
            name
            collectorsNote

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
`
