import type { NextApiRequest, NextApiResponse } from "next";

import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "../../../utils";
import { z } from "zod";
import got from "got";

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

  try {
    await got
      .post(type === "sold" ? soldWebhook : listWebhook, {
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
                  value: name,
                },
                {
                  name: "Collection",
                  value: `[${collection}](https://marketplace.treasure.lol/collection/${address})`,
                },
                updates
                  ? updates.price === price
                    ? priceField
                    : {
                        ...priceField,
                        value: `${formatPrice(price)} $MAGIC → ${formatPrice(
                          updates.price
                        )} $MAGIC`,
                      }
                  : priceField,
                ,
                updates
                  ? updates.quantity === quantity
                    ? quantityField
                    : {
                        ...quantityField,
                        value: `${quantity} → ${updates.quantity}`,
                      }
                  : quantityField,
                expires && updates
                  ? updates.expires === expires
                    ? expiresField
                    : {
                        ...expiresField,
                        value: `${formatDistanceToNow(
                          expires
                        )} → ${formatDistanceToNow(updates.expires)}`,
                      }
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
      })
      .json();

    console.log("Webhook posted successfully!");
  } catch (error) {
    console.log("error", error);
    console.log("error.message", error.message);
  }

  res.status(200).json({ ok: true });
}
