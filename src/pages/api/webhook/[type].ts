import type { NextApiRequest, NextApiResponse } from "next";

import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "../../../utils";
import { z } from "zod";
import got from "got";

const collectionWebhooks = {
  realm: {
    listWebhook: process.env.REALM_LIST_WEBHOOK,
    soldWebhook: process.env.REALM_SOLD_WEBHOOK,
  },
  "smithonia-resources": {
    listWebhook: process.env.SMITHONIA_WEAPONS_LIST_WEBHOOK,
    soldWebhook: process.env.SMITHONIA_WEAPONS_SOLD_WEBHOOK,
  },
  "smithonia-weapons": {
    listWebhook: process.env.SMITHONIA_WEAPONS_LIST_WEBHOOK,
    soldWebhook: process.env.SMITHONIA_WEAPONS_SOLD_WEBHOOK,
  },
  "smol-bodies": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-bodies-pets": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-brains": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-brains-land": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-cars": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-treasures": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "smol-brains-pets": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  swolercycles: {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  "tales-of-elleria": {
    listWebhook: process.env.TALES_OF_ELLERIA_LIST_WEBHOOK,
    soldWebhook: process.env.TALES_OF_ELLERIA_SOLD_WEBHOOK,
  },
};

function formatUpdate<T>(
  valueRaw: T,
  updatedRaw: T,
  field: { name: string; value: number | string | null },
  format = (value: T) => `${value}`
) {
  const value = format(valueRaw);
  const updated = format(updatedRaw);

  return updated === value
    ? field
    : {
        ...field,
        value: `${value} → ${updated}`,
      };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method?.toLowerCase() !== "post") {
    res.status(405);

    return;
  }

  const listWebhook = process.env.LIST_WEBHOOK;
  const soldWebhook = process.env.SOLD_WEBHOOK;

  if (!listWebhook || !soldWebhook) {
    res.status(500);

    return;
  }

  const { type } = z
    .object({ type: z.enum(["list", "sold", "update"]) })
    .parse(req.query);

  const {
    collection,
    expires,
    image,
    name,
    price,
    quantity,
    slug,
    tokenId,
    updates,
    user,
  } = z
    .object({
      collection: z.string(),
      expires: z.number().optional(),
      image: z.string(),
      name: z.string(),
      price: z.string(),
      quantity: z.number(),
      slug: z.string(),
      tokenId: z.string(),
      updates: z
        .object({
          expires: z.number(),
          price: z.string(),
          quantity: z.number(),
        })
        .optional(),
      user: z.string(),
    })
    .parse(req.body);

  const expiresField = {
    name: "Expires in",
    value: expires ? formatDistanceToNow(expires) : null,
  };
  const priceField = {
    name: `${type === "sold" ? "Sale" : "Listing"} Price`,
    value: `${formatPrice(price)} $MAGIC`,
  };
  const quantityField = { name: "Quantity", value: quantity };

  const payload = {
    json: {
      embeds: [
        {
          color: type === "update" ? 0x663399 : 0xef4444,
          title:
            type === "list"
              ? "Item Listed!"
              : type === "update"
              ? "Item Updated!"
              : "Item Sold!",
          thumbnail: {
            url: image.startsWith("/img/")
              ? `https://marketplace.treasure.lol${image}`
              : image,
          },
          fields: [
            {
              name: "Name",
              value: `[${name}](https://marketplace.treasure.lol/collection/${slug}/${tokenId})`,
            },
            {
              name: "Collection",
              value: `[${collection}](https://marketplace.treasure.lol/collection/${slug})`,
            },
            updates
              ? formatUpdate(
                  price,
                  updates.price,
                  priceField,
                  (value) => `${formatPrice(value)} $MAGIC`
                )
              : priceField,
            ,
            updates
              ? formatUpdate(quantity, updates.quantity, quantityField)
              : quantityField,
            expires && updates
              ? formatUpdate(
                  expires,
                  updates.expires,
                  expiresField,
                  (value) => `${formatDistanceToNow(value)}`
                )
              : expires
              ? expiresField
              : null,
            {
              name: type === "sold" ? "Buyer" : "Seller",
              value: user,
            },
          ].filter(Boolean),
          footer: {
            text: `${
              type === "list"
                ? "Listed"
                : type === "update"
                ? "Updated"
                : "Sold"
            } on Treasure Marketplace • ${new Date().toLocaleDateString()}`,
            icon_url: "https://marketplace.treasure.lol/favicon-32x32.png",
          },
        },
      ],
    },
  };

  try {
    await got.post(type === "sold" ? soldWebhook : listWebhook, payload).json();

    if (collectionWebhooks[slug]) {
      console.log("Posting to collection webhook!");

      await got
        .post(
          type === "sold"
            ? collectionWebhooks[slug].soldWebhook
            : collectionWebhooks[slug].listWebhook,
          payload
        )
        .json();
    }

    console.log("Webhook posted successfully!");
  } catch (error) {
    console.log("error", error);
    console.log("error.message", error.message);
  }

  res.status(200).json({ ok: true });
}
