import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.ArbitrumRinkeby]: {
    magic: "0x7693604341fDC5B73c920b8825518Ec9b6bBbb8b",
    marketplace: "0x2426acC898C5E1241904fCEf6E5643241192272D",
    marketplaceBuyer: "0x24b7377Bf073E54eC42ec6CC8F4CDA6e3deB32A8",
  },
  [ChainId.Arbitrum]: {
    magic: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    marketplace: "0x2E3b85F85628301a0Bce300Dee3A6B04195A15Ee",
    marketplaceBuyer: "0x812cdA2181ed7c45a35a691E0C85E231D218E273",
  },
};

// TODO: Put this data in the graph
export const coreCollections = ["Legion Genesis", "Treasures", "Smol Brains"];

export const BridgeworldItems = [
  "Legion Auxiliary",
  "Legion Genesis",
  "Legions",
  "Consumables",
];

export const FEE = 0.05;
export const USER_SHARE = 1 - FEE;
