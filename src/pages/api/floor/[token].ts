import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import {
  Listing_OrderBy,
  OrderDirection,
  Status,
} from "../../../../generated/marketplace.graphql";
import { marketplace } from "../../../lib/client";
import { getTokenIds } from "../listed/[address]";

const TALES_OF_ELLERIA_ADDRESS = "0x7480224ec2b98f28cee3740c80940a2f489bf352";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method?.toLowerCase() !== "get") {
    res.status(405);

    return;
  }

  const { token } = z
    .object({ token: z.string().regex(/^0x[0-9a-f]{40}-\d+$/) })
    .parse(req.query);

  const [address, tokenId] = token.split("-");

  if (TALES_OF_ELLERIA_ADDRESS === address) {
    const tokenIds = await getTokenIds(address);

    const listings = await marketplace.getCollectionListings({
      erc1155Filters: {
        id_in: tokenIds,
      },
      erc721Filters: {
        status: Status.Active,
        token_in: tokenIds,
      },
      erc721Ordering: Listing_OrderBy.pricePerItem,
      isERC1155: false,
      orderDirection: OrderDirection.asc,
      skip: 0,
    });

    res.status(200).json({ price: listings.listings?.[0].pricePerItem });

    return;
  }

  const floor = await marketplace.getFloorPrice({
    collection: address,
    tokenId: tokenId,
  });

  res.status(200).json({
    price:
      floor.collection?.tokens[0].floorPrice ?? floor.collection?.floorPrice,
  });
}
