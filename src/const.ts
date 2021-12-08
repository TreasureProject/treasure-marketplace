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

export const coreCollections = ["Legions", "Treasures", "Smol Brains"];

export const collections = {
  [ChainId.Rinkeby]: [
    {
      name: "Extra Life",
      address: "0x5e6ae51147d1eC18EdCCAe516A59fb0A26a0b48F",
    },
    // { name: "Getting Bodied", address: "#" },
    {
      name: "Keys",
      address: "0x25EE208B4F8636B5cEaAfdee051bf0BFE514f5f6",
    },
    { name: "Legions", address: "0x6Fd12312f70fa5b04d66584600f39aBE31A99708" },
    {
      name: "Legions Genesis",
      address: "0xAC2F8732A67C15Bf81f8A6181364cE753E915037",
    },
    // { name: "Life", address: "#" },
    {
      name: "Seed of Life",
      address: "0x6A67fbf40142E3Db2e6a950A4D48B0EB41107cE8",
    },
    {
      name: "Smol Brains",
      address: "0x4FeeA06250D9f315a6a454c9c8a7fcBCf8701210",
    },
    {
      name: "Smol Brains Land",
      address: "0xe42C57AB8E093d21e52cB07B5f32b1B106cDBfe4",
    },
    {
      name: "Treasures",
      address: "0x61B468f85B2e50bAA0B1729ffC99eFe9EF0428f0",
    },
    {
      name: "Smol Cars",
      address: "0x16BDf0B2D8Bb8E98AeCB32e004feBf9653DA5f43",
    },
  ],
  [ChainId.Arbitrum]: [
    {
      name: "Extra Life",
      address: "0x21e1969884D477afD2Afd4Ad668864a0EebD644c",
    },
    // { name: "Getting Bodied", address: "#" },
    {
      name: "Keys",
      address: "0xf0a35bA261ECE4FC12870e5B7b9E7790202EF9B5",
    },
    { name: "Legions", address: "0x658365026D06F00965B5bb570727100E821e6508" },
    {
      name: "Legions Genesis",
      address: "0xE83c0200E93Cb1496054e387BDdaE590C07f0194",
    },
    {
      name: "Smol Brains Land",
      address: "0xd666d1CC3102cd03e07794A61E5F4333B4239F53",
    },
    {
      name: "Smol Brains",
      address: "0x6325439389E0797Ab35752B4F43a14C004f22A9c",
    },
    {
      name: "Treasures",
      address: "0xEBba467eCB6b21239178033189CeAE27CA12EaDf",
    },
    {
      name: "Seed of Life",
      address: "0x3956C81A51FeAed98d7A678d53F44b9166c8ed66",
    },
    {
      name: "Smol Cars",
      address: "0xB16966daD2B5a5282b99846B23dcDF8C47b6132C",
    },
  ],
};

export const FEE = 0.05;
export const USER_SHARE = 1 - FEE;
