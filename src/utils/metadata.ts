import { formatDistanceToNow, isAfter } from "date-fns";
import { GetBridgeworldMetadataQuery } from "../../generated/bridgeworld.graphql";

import { NormalizedMetadata } from "../types";
import { formatNumber, formatPercent } from "../utils";

function getCraftingMaxXpPerLevel(level: number): number {
  switch (level) {
    case 1:
      return 140;
    case 2:
    case 3:
    case 4:
      return 160;
    case 5:
      return 480;
    default:
      return 0;
  }
}

function getQuestingMaxXpPerLevel(level: number): number {
  switch (level) {
    case 1:
      return 100;
    case 2:
      return 200;
    case 3:
      return 500;
    case 4:
      return 1000;
    case 5:
      return 2000;
    default:
      return 0;
  }
}

export function normalizeBridgeworldTokenMetadata(
  token: GetBridgeworldMetadataQuery["tokens"][number] | undefined
) {
  if (!token) return null;

  const metadata = token.metadata;
  const tokenMetadata: NormalizedMetadata = {
    id: token.id,
    description: "",
    image: token.image,
    name: token.name,
    attributes: [],
  };

  if (token.name === "Balancer Crystal") {
    tokenMetadata.description = "Crystal";
  }

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

    const cooldownValue =
      !metadata.cooldown ||
      isAfter(new Date(), new Date(Number(metadata.cooldown)))
        ? "None"
        : formatDistanceToNow(Number(metadata.cooldown));

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
          value: cooldownValue,
        },
      },
      {
        attribute: {
          name: "Crafting Level",
          value: `${metadata.crafting} (${
            metadata.craftingXp
          }/${getCraftingMaxXpPerLevel(metadata.crafting)})`,
        },
      },
      {
        attribute: {
          name: "Questing Level",
          value: `${metadata.questing} (${
            metadata.questingXp
          }/${getQuestingMaxXpPerLevel(metadata.questing)})`,
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
      {
        attribute: {
          name: "Constellation: Dark",
          value: metadata.constellation?.dark ?? 0,
        },
      },
      {
        attribute: {
          name: "Constellation: Earth",
          value: metadata.constellation?.earth ?? 0,
        },
      },
      {
        attribute: {
          name: "Constellation: Fire",
          value: metadata.constellation?.fire ?? 0,
        },
      },
      {
        attribute: {
          name: "Constellation: Light",
          value: metadata.constellation?.light ?? 0,
        },
      },
      {
        attribute: {
          name: "Constellation: Water",
          value: metadata.constellation?.water ?? 0,
        },
      },
      {
        attribute: {
          name: "Constellation: Wind",
          value: metadata.constellation?.wind ?? 0,
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
