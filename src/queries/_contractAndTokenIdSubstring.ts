export const contractAndTokenIdSubstring = `
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
`;
