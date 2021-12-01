/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/typography'),
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/
import * as React from "react";
import { Disclosure } from "@headlessui/react";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  ShoppingCartIcon,
  StarIcon,
} from "@heroicons/react/solid";
import { MinusSmIcon, PlusSmIcon } from "@heroicons/react/outline";
import Image from "next/image";
import { getExplorerAddressLink, shortenIfAddress } from "@yuyao17/corefork";
import Link from "next/link";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import client from "../../../lib/client";
import { AddressZero, Zero } from "@ethersproject/constants";
import { useBuyItem, useChainId } from "../../../lib/hooks";
import { CenterLoadingDots } from "../../../components/CenterLoadingDots";
import { formatPrice, generateIpfsLink } from "../../../utils";
import { CheckIcon, ThumbUpIcon, UserIcon } from "@heroicons/react/solid";
import { GetTokenDetailsQuery, Status } from "../../../../generated/graphql";
import { formatDistanceToNow } from "date-fns";

const product = {
  name: "#14",
  price: "1,400",
  rating: 4,
  images: [
    {
      id: 1,
      name: "Angled view",
      src: "https://tailwindui.com/img/ecommerce-images/product-page-03-product-01.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    // More images...
  ],
  colors: [
    {
      name: "Washed Black",
      bgColor: "bg-gray-700",
      selectedColor: "ring-gray-700",
    },
    { name: "White", bgColor: "bg-white", selectedColor: "ring-gray-400" },
    {
      name: "Washed Gray",
      bgColor: "bg-gray-500",
      selectedColor: "ring-gray-500",
    },
  ],
  description: `
    <p>The Zip Tote Basket is the perfect midpoint between shopping tote and comfy backpack. With convertible straps, you can hand carry, should sling, or backpack this convenient and spacious bag. The zip top and durable canvas construction keeps your goods protected for all-day use.</p>
  `,
  details: [
    {
      name: "Attributes",
      items: [
        "Multiple strap configurations",
        "Spacious interior with top zip",
        "Leather handle and tabs",
        "Interior dividers",
        "Stainless strap loops",
        "Double stitched construction",
        "Water-resistant",
      ],
    },
    {
      name: "Details",
      items: [
        "Multiple strap configurations",
        "Spacious interior with top zip",
        "Leather handle and tabs",
        "Interior dividers",
        "Stainless strap loops",
        "Double stitched construction",
        "Water-resistant",
      ],
    },
    // More sections...
  ],
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const router = useRouter();

  const { address, tokenId } = router.query;

  const formattedTokenId = Array.isArray(tokenId) ? tokenId[0] : tokenId;

  const formattedAddress = Array.isArray(address)
    ? address[0]
    : address?.toLowerCase() ?? AddressZero;

  const { data, isLoading, isIdle } = useQuery(
    ["details", formattedTokenId],
    () =>
      client.getTokenDetails({
        collectionId: formattedAddress,
        tokenId: formattedTokenId,
      }),
    {
      enabled: !!address || !!tokenId,
      refetchInterval: false,
    }
  );

  const { send, state } = useBuyItem(formattedTokenId);
  const chainId = useChainId();

  const tokenInfo =
    data &&
    data?.collection?.tokens &&
    data?.collection?.tokens.length > 0 &&
    data.collection.tokens[0];

  const loading = isLoading || isIdle;

  const salePrice =
    tokenInfo &&
    tokenInfo.listings &&
    tokenInfo.listings.length > 0 &&
    tokenInfo.listings[tokenInfo.listings.length - 1].status === Status.Active
      ? tokenInfo.listings[tokenInfo.listings.length - 1].pricePerItem
      : null;

  return (
    <div className="pt-12">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8 pt-12">
        {loading && <CenterLoadingDots className="h-96" />}
        {!tokenInfo && !loading && (
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Sorry, we couldn&apos;t find this item. 😞
            </h3>
            <Link href={`/collection/${formattedAddress}`}>
              <a className="mt-7 inline-flex space-x-2 items-center text-red-500 hover:underline">
                <ArrowLeftIcon className="h-4 w-4" />
                <p className="capsize">Back to Collection</p>
              </a>
            </Link>
          </div>
        )}
        {tokenInfo && (
          <>
            <Link href={`/collection/${formattedAddress}`} passHref>
              <a className="text-gray-600 inline-flex items-center space-x-2 hover:text-gray-800">
                <ArrowLeftIcon className="h-3 w-3" />
                <p className="capsize text-xs">Back to Collection</p>
              </a>
            </Link>
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-8">
              {/* Image gallery */}
              <div className="w-full aspect-w-1 aspect-h-1">
                <Image
                  src={
                    tokenInfo.metadata?.image?.includes("ipfs")
                      ? generateIpfsLink(tokenInfo.metadata.image)
                      : tokenInfo.metadata?.image ?? ""
                  }
                  layout="fill"
                  alt={tokenInfo.metadata?.name ?? ""}
                />
              </div>

              {/* Product info */}
              <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                <h2 className="tracking-tight text-red-500">
                  {tokenInfo.collection.name}
                </h2>
                <div className="mt-3">
                  <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
                    {tokenInfo.metadata?.name ?? ""}
                  </h2>
                </div>
                <div className="mt-2 text-xs">
                  Owned by: <span>{shortenIfAddress(tokenInfo.owner?.id)}</span>
                </div>

                {!!salePrice ? (
                  <>
                    <div className="mt-10">
                      <h2 className="sr-only">Price</h2>
                      <p className="text-3xl text-gray-900">
                        {formatPrice(salePrice)}
                        <span className="ml-2 text-xs">$MAGIC</span>
                      </p>
                    </div>

                    <div className="mt-6">
                      <button className="max-w-xs flex-1 bg-red-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-red-500 sm:w-full">
                        Purchase
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-10 text-gray-500">
                    This item is currently not for sale
                  </div>
                )}

                <section aria-labelledby="details-heading" className="mt-12">
                  <h2 id="details-heading" className="sr-only">
                    Additional details
                  </h2>

                  <div className="border-t divide-y divide-gray-200">
                    <Disclosure as="div" defaultOpen>
                      {({ open }) => (
                        <>
                          <h3>
                            <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                              <span
                                className={classNames(
                                  open ? "text-red-700" : "text-gray-900",
                                  "text-sm font-medium"
                                )}
                              >
                                Attributes
                              </span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusSmIcon
                                    className="block h-6 w-6 text-red-400 group-hover:text-red-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <PlusSmIcon
                                    className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel as="div">
                            {tokenInfo.metadata?.attributes ? (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pb-6">
                                {tokenInfo.metadata?.attributes.map(
                                  ({ attribute }) => (
                                    <div
                                      key={attribute.id}
                                      className="border-2 border-red-400 rounded-md bg-red-200 flex items-center flex-col py-2"
                                    >
                                      <p className="text-red-700">
                                        {attribute.name}
                                      </p>
                                      <p className="mt-1 font-medium">
                                        {attribute.value}
                                      </p>
                                      <p className="mt-3 text-xs text-gray-500">
                                        {Number(
                                          attribute.percentage
                                        ).toLocaleString("en-US", {
                                          style: "percent",
                                        })}{" "}
                                        have this trait
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500">No attributes</div>
                            )}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                    <Disclosure as="div" defaultOpen>
                      {({ open }) => (
                        <>
                          <h3>
                            <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                              <span
                                className={classNames(
                                  open ? "text-red-700" : "text-gray-900",
                                  "text-sm font-medium"
                                )}
                              >
                                Details
                              </span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusSmIcon
                                    className="block h-6 w-6 text-red-400 group-hover:text-red-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <PlusSmIcon
                                    className="block h-6 w-6 text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel as="div">
                            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Contract ID
                                </dt>
                                <dd className="mt-1">
                                  <a
                                    href={getExplorerAddressLink(
                                      formattedAddress,
                                      chainId
                                    )}
                                    className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <p>{shortenIfAddress(formattedAddress)}</p>
                                    <ExternalLinkIcon className="h-4 w-4" />
                                  </a>
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Token ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {formattedTokenId}
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Token Standard
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  ERC-721
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Rarity
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  Rare AF
                                </dd>
                              </div>
                            </div>
                            <div className="mt-12">
                              <p className="text-sm font-medium text-gray-500">
                                Item Activity
                              </p>
                              <div className="flow-root mt-4">
                                <ul role="list" className="-mb-8">
                                  {!tokenInfo.listings ||
                                    (tokenInfo.listings.length === 0 && (
                                      <p className="mt-1 text-sm text-gray-900">
                                        No Timeline Available
                                      </p>
                                    ))}
                                  {tokenInfo.listings &&
                                    tokenInfo.listings
                                      .slice(0)
                                      // Latest one to the top
                                      .reverse()
                                      .map((listing, listingIdx) => (
                                        <li key={listing.id}>
                                          <div className="relative pb-8">
                                            {listingIdx !==
                                            (tokenInfo.listings ?? []).length -
                                              1 ? (
                                              <span
                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                aria-hidden="true"
                                              />
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                              <div>
                                                {(() => {
                                                  switch (listing.status) {
                                                    case Status.Sold:
                                                      return (
                                                        <span className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                                                          <ShoppingCartIcon
                                                            className="h-5 w-5 text-white"
                                                            aria-hidden="true"
                                                          />
                                                        </span>
                                                      );
                                                    case Status.Active:
                                                      return (
                                                        <span className="bg-red-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                                                          <CurrencyDollarIcon
                                                            className="h-5 w-5 text-white"
                                                            aria-hidden="true"
                                                          />
                                                        </span>
                                                      );
                                                    case Status.Hidden:
                                                      return (
                                                        <span className="bg-gray-400 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                                                          <EyeOffIcon
                                                            className="h-5 w-5 text-white"
                                                            aria-hidden="true"
                                                          />
                                                        </span>
                                                      );
                                                  }
                                                })()}
                                              </div>
                                              <div className="min-w-0 flex-1 pt-2 flex justify-between space-x-4">
                                                <div>
                                                  <p className="text-xs text-gray-500">
                                                    {timelineContent(listing)}
                                                  </p>
                                                </div>
                                                <div className="text-right text-xs whitespace-nowrap text-gray-500">
                                                  {formatDistanceToNow(
                                                    new Date(
                                                      Number(
                                                        listing.blockTimestamp
                                                      ) * 1000
                                                    ),
                                                    { addSuffix: true }
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                </ul>
                              </div>
                            </div>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const timelineContent = (
  listing: Exclude<
    Exclude<
      GetTokenDetailsQuery["collection"],
      null | undefined
    >["tokens"][number]["listings"],
    null | undefined
  >[number]
) => {
  switch (listing.status) {
    case Status.Sold:
      return (
        <p>
          {shortenIfAddress(listing.user.id)} sold to{" "}
          {listing.buyer?.id ? shortenIfAddress(listing.buyer.id) : "Unknown"}{" "}
          for{" "}
          <span className="font-medium text-gray-900">
            {formatPrice(listing.pricePerItem)}
          </span>{" "}
          $MAGIC
        </p>
      );
    case Status.Active:
      return (
        <p>
          {shortenIfAddress(listing.user.id)} listed this item for{" "}
          <span className="font-medium text-gray-900">
            {formatPrice(listing.pricePerItem)}
          </span>{" "}
          $MAGIC
        </p>
      );
    case Status.Hidden:
      return <p>{shortenIfAddress(listing.user.id)} hidden this item</p>;
  }
};
