import { GetCollectionListingsQuery } from "../generated/graphql";

export type ListedNft = Exclude<
  GetCollectionListingsQuery["collection"],
  null | undefined
>["listings"][number] & { standard: "ERC721" | "ERC1155" };

export type Nft = {
  address: string;
  collection: string;
  listing?: {
    expires: string;
    pricePerItem: string;
    quantity: number;
  };
  name: string;
  total: number;
  standard: "ERC721" | "ERC1155";
  source: string;
  tokenId: string;
};
