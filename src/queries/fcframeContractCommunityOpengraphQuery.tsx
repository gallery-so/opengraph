import { contractAndTokenIdSubstring } from './_contractAndTokenIdSubstring';
import { mediaQuerySubstring } from './_mediaQuerySubstring';

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
            ${contractAndTokenIdSubstring}
          }
        }
      }
    }
  }
`;
