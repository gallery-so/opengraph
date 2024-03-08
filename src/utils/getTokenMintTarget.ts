type Chain = 'Ethereum' | 'Arbitrum' | 'Polygon' | 'Optimism' | 'Tezos' | 'POAP' | 'Zora' | 'Base';

function evmChainToChainId(chain: Chain) {
  if (chain === 'Tezos' || chain === 'POAP') {
    return null;
  }
  return {
    Ethereum: 1,
    Arbitrum: 42161,
    Polygon: 137,
    Optimism: 10,
    Zora: 7777777,
    Base: 8453,
  }[chain];
}

type Token = {
  definition: {
    tokenId: string;
    community: {
      communityKey: {
        contract: {
          address: string;
          chain: Chain;
        };
      };
    };
  };
};

// mint target must be CAIP-10 compatible
// https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-10.md
//
// e.g.
// eip155:8453:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb:1

export function getTokenMintTarget(token: Token) {
  const chain = token.definition.community.communityKey.contract.chain;
  const contractAddress = token.definition.community.communityKey.contract.address;
  const tokenId = token.definition.tokenId;

  if (chain === 'Tezos') {
    // Tezos not supported by FC frames
    // return `tezos:Mainnet:${contractAddress}:${tokenId}`;
    return null;
  }

  if (chain === 'POAP') {
    // POAP does not follow CAIP standard, and is not supported by FC frames
    return null;
  }

  const chainId = evmChainToChainId(chain);
  return `eip155:${chainId}:${contractAddress}:${tokenId}`;
}
