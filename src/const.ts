import { ChainId } from "@yuyao17/corefork";

export const Contracts = {
  [ChainId.Rinkeby]: {
    magic: "0xFd25767f710966F8a557b236a3CaeF8F92Eb7C10",
    marketplace: "0xeadbc40f5176Fd6eAb8E63cDF55b9caBa216E682",
  },
  [ChainId.Arbitrum]: {
    magic: "0x539bdE0d7Dbd336b79148AA742883198BBF60342",
    marketplace: "0x2E3b85F85628301a0Bce300Dee3A6B04195A15Ee",
  },
};

// TODO: Put this data in the graph
export const coreCollections = ["Legions", "Treasures", "Smol Brains"];

export const FEE = 0.05;
export const USER_SHARE = 1 - FEE;
