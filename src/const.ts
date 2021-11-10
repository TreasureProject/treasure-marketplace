import { ChainId } from "@yuyao17/corefork";

export const Contracts = {
  [ChainId.Rinkeby]: {
    magic: "0xFd25767f710966F8a557b236a3CaeF8F92Eb7C10",
    marketplace: "0xeadbc40f5176Fd6eAb8E63cDF55b9caBa216E682",
  },
};

export const coreCollections = ["Legions", "Treasures", "Smol Brains"];

export const collections = [
  // TODO: Move to const
  { name: "Legions", address: "0x6Fd12312f70fa5b04d66584600f39aBE31A99708" },
  {
    name: "Legions Genesis",
    address: "0xAC2F8732A67C15Bf81f8A6181364cE753E915037",
  },
  {
    name: "Smol Brains",
    address: "0xd72e14b8bcc89742b3f366ea80d175c3c4205b1d",
  },
  // { name: "Getting Bodied", address: "#" },
  {
    name: "Treasures",
    address: "0x61B468f85B2e50bAA0B1729ffC99eFe9EF0428f0", // TODO: replace with mainnet
  },
  {
    name: "Keys",
    address: "0x25EE208B4F8636B5cEaAfdee051bf0BFE514f5f6", // TODO: replace with mainnet
  },
  {
    name: "Extra Life",
    address: "0x5e6ae51147d1eC18EdCCAe516A59fb0A26a0b48F",
  },
  {
    name: "Seed of Life",
    address: "0x6A67fbf40142E3Db2e6a950A4D48B0EB41107cE8",
  },
  // { name: "Life", address: "#" },
] as const;

export const DAO_SHARE = 0.025;
export const CREATOR_SHARE = 0.025;
export const USER_SHARE = 1 - DAO_SHARE - CREATOR_SHARE;
