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
