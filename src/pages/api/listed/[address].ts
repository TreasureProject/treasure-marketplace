import got from "got";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { marketplace } from "../../../lib/client";

type Metadata = {
  agility: number;
  bonusUpgradeChance: number;
  endurance: number;
  exp: number;
  heroClass: number;
  heroName: string;
  intelligence: number;
  isAlive: boolean;
  isStaked: boolean;
  level: number;
  maxQuestAttempts: number;
  owner: string;
  questAttempts: number;
  requiredExp: number;
  sender: string;
  strength: number;
  tokenAddress: string;
  tokenId: number;
  totalAttributes: number;
  vitality: number;
  will: number;
};

const unique = <T>(array: T[]) => Array.from(new Set(array));

export const TALES_OF_ELLERIA_ADDRESS =
  "0x7480224ec2b98f28cee3740c80940a2f489bf352";

export async function getTokenIds(address: string) {
  const listed = await marketplace.getCollectionsListedTokens({
    collection: address,
  });

  const listedIds = unique(listed.listings.map((listing) => listing.token.id));

  if (TALES_OF_ELLERIA_ADDRESS === address) {
    const metadata = await Promise.all<Metadata>(
      listedIds.map((item) =>
        got(
          `${
            process.env.NEXT_PUBLIC_TALES_OF_ELLERIA_RELICS_API
          }/api/heroes/${parseInt(item.slice(45), 16)}`
        ).json()
      )
    );

    const tokenIds = metadata
      .filter((item) => !item.isStaked)
      .map(
        (item) => `${TALES_OF_ELLERIA_ADDRESS}-0x${item.tokenId.toString(16)}`
      );

    return tokenIds;
  }

  return listedIds;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method?.toLowerCase() !== "get") {
    res.status(405);

    return;
  }

  const { address } = z
    .object({ address: z.string().regex(/^0x[0-9a-f]{40}$/) })
    .parse(req.query);

  res.status(200).json(await getTokenIds(address));
}
