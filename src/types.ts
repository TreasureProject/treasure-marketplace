import {
  GetTokenDetailsQuery,
  ListingFieldsWithTokenFragment,
  TokenStandard,
} from "../generated/graphql";

export type targetNftT = {
  metadata: Exclude<
    GetTokenDetailsQuery["collection"],
    null | undefined
  >["tokens"][number]["metadata"];
  payload: ListingFieldsWithTokenFragment & {
    standard: TokenStandard;
    tokenId: string;
  };
};

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
