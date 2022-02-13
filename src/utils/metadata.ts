import { formatDistanceToNow } from "date-fns";

import { BridgeworldToken, NormalizedMetadata } from "../types";
import { formatNumber, formatPercent } from "../utils";

export function normalizeBridgeworldTokenMetadata(
  token: BridgeworldToken
): NormalizedMetadata {
  const metadata = token.metadata;
  const tokenMetadata: NormalizedMetadata = {
    id: token.id,
    description: "",
    image: token.image,
    name: token.name,
    attributes: [],
  };

  if (metadata?.__typename === "ConsumableInfo") {
    tokenMetadata.description = "Consumables";
    tokenMetadata.attributes = [
      {
        attribute: {
          name: "Size",
          value: metadata.size?.toString() ?? "None",
        },
      },
      {
        attribute: {
          name: "Type",
          value: metadata.type,
        },
      },
    ];
  } else if (metadata?.__typename === "LegionInfo") {
    tokenMetadata.description = "Legions";
    tokenMetadata.attributes = [
      {
        attribute: {
          name: "Atlas Mine Boost",
          value: formatPercent(metadata.boost),
        },
      },
      {
        attribute: {
          name: "Summon Fatigue",
          value: metadata.cooldown
            ? formatDistanceToNow(Number(metadata.cooldown.toString()))
            : "None",
        },
      },
      {
        attribute: {
          name: "Crafting Level",
          value: metadata.crafting,
        },
      },
      {
        attribute: {
          name: "Questing Level",
          value: metadata.questing,
        },
      },
      {
        attribute: {
          name: "Rarity",
          value: metadata.rarity,
        },
      },
      {
        attribute: {
          name: "Class",
          value: metadata.role,
        },
      },
      {
        attribute: {
          name: "Type",
          value: metadata.type,
        },
      },
      {
        attribute: {
          name: "Times Summoned",
          value: formatNumber(Number(metadata.summons.toString())),
        },
      },
    ];
  } else if (metadata?.__typename === "TreasureInfo") {
    tokenMetadata.description = "Treasures";
    tokenMetadata.attributes = [
      {
        attribute: {
          name: "Atlas Mine Boost",
          value: formatPercent(metadata.boost),
        },
      },
      {
        attribute: {
          name: "Category",
          value: metadata.category,
        },
      },
      {
        attribute: {
          name: "Tier",
          value: metadata.tier,
        },
      },
    ];
  }

  return tokenMetadata;
}
