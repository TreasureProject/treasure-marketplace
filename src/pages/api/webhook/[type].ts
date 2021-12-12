import type { NextApiRequest, NextApiResponse } from "next";

import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "../../../utils";
import { z } from "zod";
import got from "got";

const collectionWebhooks = {
  // Smol Bodies
  "0x9e638BFe78B372b8f5CC63Cf6b01B90F568496cB": {
    listWebhook: process.env.SMOLBODIES_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBODIES_SOLD_WEBHOOK,
  },
  // Smol Brains
  "0x6325439389e0797ab35752b4f43a14c004f22a9c": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  // Smol Brains Land
  "0xd666d1cc3102cd03e07794a61e5f4333b4239f53": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
  },
  // Smol Cars
  "0xb16966dad2b5a5282b99846b23dcdf8c47b6132c": {
    listWebhook: process.env.SMOLBRAINS_LIST_WEBHOOK,
    soldWebhook: process.env.SMOLBRAINS_SOLD_WEBHOOK,
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
    address,
    collection,
    expires,
    tokenId,
    image,
    name,
    price,
    quantity,
    updates,
    user,
  } = z
    .object({
      address: z.string(),
      collection: z.string(),
      tokenId: z.string(),
      expires: z.number().optional(),
      image: z.string(),
      name: z.string(),
      price: z.string(),
      quantity: z.number(),
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
            url: image,
          },
          fields: [
            {
              name: "Name",
              value: `[${name}](https://marketplace.treasure.lol/collection/${address}/${tokenId})`,
            },
            {
              name: "Collection",
              value: `[${collection}](https://marketplace.treasure.lol/collection/${address})`,
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

    const lowerAddress = address.toLowerCase();

    if (collectionWebhooks[lowerAddress]) {
      console.log("Posting to collection webhook!");

      await got
        .post(
          type === "sold"
            ? collectionWebhooks[lowerAddress].soldWebhook
            : collectionWebhooks[lowerAddress].listWebhook,
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
