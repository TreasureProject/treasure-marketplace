import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.ArbitrumRinkeby]: {
    magic: "0x7693604341fDC5B73c920b8825518Ec9b6bBbb8b",
    marketplace: "0x48d515a012429d97E27aA8fC84070cF2E45e5036",
  },
  [ChainId.Arbitrum]: {
    magic: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    marketplace: "0x09986B4e255B3c548041a30A2Ee312Fe176731c2",
  },
};

export const BridgeworldItems = [
  "Legion Auxiliary",
  "Legion Genesis",
  "Legions",
  "Consumables",
  "Balancer Crystal",
];

export const smolverseItems = [
  "Smol Bodies Pets",
  "Smol Brains Pets",
  "Smol Treasures",
];

export const METADATA_COLLECTIONS = ["Peek-A-Boo", "Tales of Elleria"];

export const FEE = 0.05;
export const USER_SHARE = 1 - FEE;

export const BATTLEFLY_METADATA = {
  battleflies: {
    name: "Cocoon",
    description: "Ordinary cocoon, what's inside?",
    image:
      "https://ipfs.infura.io/ipfs/QmecUwQADn2yd2tNBoVvWLuknYMxY8WLnWVfATHG452VJP",
    attributes: [
      {
        trait_type: "Type",
        value: "Genesis",
      },
      {
        trait_type: "Class",
        value: "Original",
      },
    ],
  },
  specials: {
    name: "v1 Founder",
    description:
      "BattleFly v1 Founders NFT represents ownership of the BattleFly Game. There is only 220 NFT in circulation.",
    image:
      "https://ipfs.infura.io/ipfs/QmXsiziZsoYEz5sqz7rHCYdtuqaBPrpQbn7UnuUpcf2n6Z",
    attributes: [],
  },
};
