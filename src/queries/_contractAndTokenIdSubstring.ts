export const contractAndTokenIdSubstring = `
  tokenId
  community {
    subtype {
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
`;
