import { mediaQuerySubstring } from './mediaQuerySubstring';

export const fcframeContractCommunityOpengraphQuery = `
  query fcframeContractCommunityOpengraphQuery($contractCommunityKey: ContractCommunityKeyInput!) {
    community: contractCommunityByKey(key: $contractCommunityKey) {
      ... on ErrCommunityNotFound {
        __typename
      }
      ... on Community {
        __typename
        name
        tokensForFrame(limit: 10) {
          owner {
            username
          }
          definition {
            name
            ${mediaQuerySubstring}
          }
        }
      }
    }
  }
`;

export const fcframeContractCommunityDimensionsOpengraphQuery = `
  query fcframeContractCommunityDimensionsOpengraphQuery($contractCommunityKey: ContractCommunityKeyInput!) {
    community: contractCommunityByKey(key: $contractCommunityKey) {
      ... on ErrCommunityNotFound {
        __typename
      }
      ... on Community {
        __typename
        name
        tokensForFrame(limit: 10) {
          definition {
            name
            media {
              ... on Media {
                dimensions {
                  aspectRatio
                }
              }
            }
            tokenId
            community {
              __typename
              ... on ContractCommunity {
                communityKey {
                  contract {
                    address
                    chain
                  }
                }
              }
              ... on ArtBlocksCommunity {
                communityKey {
                  contract {
                    address
                    chain
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
