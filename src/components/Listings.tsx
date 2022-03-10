import {
  ChevronDownIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
} from "@heroicons/react/solid";
import { CurrencyDollarIcon } from "@heroicons/react/outline";
import { FC, Fragment, useMemo } from "react";
import { ListingFieldsFragment } from "../../generated/marketplace.graphql";
import { Menu, Transition } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import { formatPrice, getCollectionSlugFromName } from "../utils";
import {
  useBattleflyMetadata,
  useCollections,
  useFoundersMetadata,
} from "../lib/hooks";
import { shortenAddress, useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import ImageWrapper from "./ImageWrapper";
import QueryLink from "./QueryLink";
import classNames from "clsx";
import { Disclosure } from "@headlessui/react";
import Link from "next/link";
import { useQuery } from "react-query";
import { bridgeworld, client, smolverse } from "../lib/client";
import { BridgeworldItems, smolverseItems } from "../const";

const sortOptions = [
  { name: "Highest Price", value: "price" },
  { name: "Latest", value: "time" },
];

type ListingProps = {
  listings: ListingFieldsFragment[];
  sort: string | string[];
  title?: string;
  includeStatus?: boolean;
};

const Listings: FC<ListingProps> = ({
  listings,
  sort,
  title,
  includeStatus,
}) => {
  const router = useRouter();
  const { account } = useEthers();

  const collections = useCollections();

  const {
    tokens,
    battleflyTokens,
    bridgeworldTokens,
    foundersTokens,
    smolverseTokens,
  } = useMemo(() => {
    return listings.reduce(
      (acc, { collection, token }) => {
        const collectionName =
          collections.find(({ id }) => id === collection.id)?.name ?? "";

        if (BridgeworldItems.includes(collectionName)) {
          acc.bridgeworldTokens.push(token.id);
        } else if (smolverseItems.includes(collectionName)) {
          acc.smolverseTokens.push(token.id);
        } else if (collectionName === "BattleFly") {
          acc.battleflyTokens.push(token.id);
        } else if (collectionName.startsWith("BattleFly")) {
          acc.foundersTokens.push(token.id);
        } else {
          acc.tokens.push(token.id);
        }

        return acc;
      },
      {
        tokens: [] as string[],
        battleflyTokens: [] as string[],
        bridgeworldTokens: [] as string[],
        foundersTokens: [] as string[],
        smolverseTokens: [] as string[],
      }
    );
  }, [collections, listings]);

  const { data: metadataData } = useQuery(
    ["metadata", tokens],
    () => client.getTokensMetadata({ ids: tokens }),
    {
      enabled: tokens.length > 0,
      refetchInterval: false,
    }
  );

  const { data: legionMetadataData } = useQuery(
    ["metadata-bridgeworld", bridgeworldTokens],
    () => bridgeworld.getBridgeworldMetadata({ ids: bridgeworldTokens }),
    {
      enabled: bridgeworldTokens.length > 0,
      refetchInterval: false,
    }
  );

  const { data: smolverseMetadata } = useQuery(
    ["metadata-smolverse", smolverseTokens],
    () => smolverse.getSmolverseMetadata({ ids: smolverseTokens }),
    {
      enabled: smolverseTokens.length > 0,
      refetchInterval: false,
    }
  );

  const battleflyMetadata = useBattleflyMetadata(battleflyTokens);
  const foundersMetadata = useFoundersMetadata(foundersTokens);

  const getListingStatus = (listing: ListingFieldsFragment) => {
    const me = account?.toLowerCase();
    if (listing.buyer?.id === me) return "Bought";
    if (listing.seller?.id === me) return "Sold";
    return "";
  };

  return (
    <div className="flex-1 flex items-stretch overflow-hidden">
      <main className="flex-1 overflow-y-auto">
        <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="flex text-2xl font-bold text-gray-900 dark:text-gray-200">
              {title}
            </h1>
            <section aria-labelledby="filter-heading">
              <h2 id="filter-heading" className="sr-only">
                Product filters
              </h2>

              <div className="flex items-center">
                <Menu as="div" className="relative z-20 inline-block text-left">
                  <div>
                    <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200">
                      Sort
                      <ChevronDownIcon
                        className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-100"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                  </div>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="origin-top-left absolute right-0 z-10 mt-2 w-48 rounded-md shadow-2xl bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        {sortOptions.map((option) => {
                          const active = option.value === sort;
                          return (
                            <Menu.Item key={option.name}>
                              <QueryLink
                                href={{
                                  pathname: router.pathname,
                                  query: {
                                    ...router.query,
                                    activitySort: option.value,
                                  },
                                }}
                                // passHref
                                className={classNames(
                                  "block px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-500",
                                  {
                                    "text-red-500 dark:text-gray-100": active,
                                  }
                                )}
                              >
                                <span>{option.name}</span>
                              </QueryLink>
                            </Menu.Item>
                          );
                        })}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
            </section>
          </div>

          <div className="mt-4 hidden lg:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-500 sticky top-0">
                <tr>
                  {includeStatus && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  )}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Price ($MAGIC)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    From
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    To
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing, index) => {
                  const collectionName = collections.find(
                    (item) => item.id === listing?.collection?.id
                  )?.name;
                  const slugOrAddress =
                    getCollectionSlugFromName(collectionName) ??
                    listing.collection.id;

                  const legionsMetadata = legionMetadataData?.tokens.find(
                    (item) => item.id === listing.token.id
                  );
                  const legacyMetadata = metadataData?.tokens.find(
                    (item) => item?.id === listing.token.id
                  );
                  const svMetadata = smolverseMetadata?.tokens.find(
                    (item) => item?.id === listing.token.id
                  );
                  const bfMetadata = battleflyMetadata.data?.find(
                    (item) => item.id === listing.token.id
                  );
                  const fsMetadata = foundersMetadata.data?.find(
                    (item) => item.id === listing.token.id
                  );

                  const metadata = legionsMetadata
                    ? {
                        id: legionsMetadata.id,
                        name: legionsMetadata.name,
                        tokenId: listing.token.tokenId,
                        metadata: {
                          image: legionsMetadata.image,
                          name: legionsMetadata.name,
                          description: collectionName ?? "Legions",
                        },
                      }
                    : svMetadata
                    ? {
                        id: svMetadata.id,
                        name: svMetadata.name,
                        tokenId: listing.token.tokenId,
                        metadata: {
                          image: svMetadata.image ?? "",
                          name: svMetadata.name,
                          description: collectionName ?? "",
                        },
                      }
                    : bfMetadata
                    ? {
                        id: bfMetadata.id,
                        name: bfMetadata.name,
                        tokenId: listing.token.tokenId,
                        metadata: {
                          image: bfMetadata.image ?? "",
                          name: bfMetadata.name,
                          description: collectionName ?? "",
                        },
                      }
                    : fsMetadata
                    ? {
                        id: fsMetadata.id,
                        name: fsMetadata.name,
                        tokenId: listing.token.tokenId,
                        metadata: {
                          image: fsMetadata.image ?? "",
                          name: fsMetadata.name,
                          description: collectionName ?? "",
                        },
                      }
                    : legacyMetadata?.metadata
                    ? {
                        id: legacyMetadata.id,
                        name: legacyMetadata.name,
                        tokenId: listing.token.tokenId,
                        metadata: {
                          image: legacyMetadata.metadata.image,
                          name: legacyMetadata.metadata.name,
                          description:
                            legacyMetadata.metadata.description.replace(
                              "Legion",
                              "Legacy Legion"
                            ),
                        },
                      }
                    : undefined;

                  return (
                    <tr
                      key={listing.id}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-200"
                          : "bg-gray-50 dark:bg-gray-300"
                      }
                    >
                      {includeStatus && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                          {getListingStatus(listing)}
                        </td>
                      )}
                      <td className="flex items-center px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {metadata?.metadata ? (
                          <ImageWrapper
                            height={48}
                            token={metadata}
                            width={48}
                          />
                        ) : (
                          <div className="animate-pulse w-full bg-gray-300 h-12 rounded-md m-auto" />
                        )}
                        <div className="pl-2">
                          <p className="text-gray-500 dark:text-gray-400 font-thin tracking-wide uppercase text-[0.5rem]">
                            {metadata?.metadata?.description ?? ""}
                          </p>
                          <Link
                            href={`/collection/${slugOrAddress}/${listing.token.tokenId}`}
                            passHref
                          >
                            <a className="text-xs text-gray-800 dark:text-gray-700 font-semibold truncate hover:underline">
                              {metadata?.name ?? ""}
                            </a>
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {formatPrice(listing.pricePerItem)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {listing.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {shortenAddress(listing.seller.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {shortenAddress(listing.buyer?.id ?? "")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-gray-700">
                        <a
                          className="flex flex-1 items-center"
                          href={listing.transactionLink ?? ""}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {formatDistanceToNow(
                            new Date(Number(listing.blockTimestamp) * 1000),
                            { addSuffix: true }
                          )}
                          <ExternalLinkIcon className="h-5 pl-2" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="lg:hidden block">
          <ul
            role="list"
            className="mt-2 divide-y divide-gray-200 dark:divide-gray-300 overflow-hidden"
          >
            {listings.map((listing) => {
              const collectionName = collections.find(
                (item) => item.id === listing?.collection?.id
              )?.name;
              const slugOrAddress =
                getCollectionSlugFromName(collectionName) ??
                listing.collection.id;

              const legionsMetadata = legionMetadataData?.tokens.find(
                (item) => item.id === listing.token.id
              );
              const legacyMetadata = metadataData?.tokens.find(
                (item) => item?.id === listing.token.id
              );
              const svMetadata = smolverseMetadata?.tokens.find(
                (item) => item?.id === listing.token.id
              );
              const bfMetadata = battleflyMetadata.data?.find(
                (item) => item.id === listing.token.id
              );
              const fsMetadata = foundersMetadata.data?.find(
                (item) => item.id === listing.token.id
              );

              const metadata = legionsMetadata
                ? {
                    id: legionsMetadata.id,
                    name: legionsMetadata.name,
                    tokenId: listing.token.tokenId,
                    metadata: {
                      image: legionsMetadata.image,
                      name: legionsMetadata.name,
                      description: collectionName ?? "Legions",
                    },
                  }
                : svMetadata
                ? {
                    id: svMetadata.id,
                    name: svMetadata.name,
                    tokenId: listing.token.tokenId,
                    metadata: {
                      image: svMetadata.image ?? "",
                      name: svMetadata.name,
                      description: collectionName ?? "",
                    },
                  }
                : bfMetadata
                ? {
                    id: bfMetadata.id,
                    name: bfMetadata.name,
                    tokenId: listing.token.tokenId,
                    metadata: {
                      image: bfMetadata.image ?? "",
                      name: bfMetadata.name,
                      description: collectionName ?? "",
                    },
                  }
                : fsMetadata
                ? {
                    id: fsMetadata.id,
                    name: fsMetadata.name,
                    tokenId: listing.token.tokenId,
                    metadata: {
                      image: fsMetadata.image ?? "",
                      name: fsMetadata.name,
                      description: collectionName ?? "",
                    },
                  }
                : legacyMetadata?.metadata
                ? {
                    id: legacyMetadata.id,
                    name: legacyMetadata.name,
                    tokenId: listing.token.tokenId,
                    metadata: {
                      image: legacyMetadata.metadata.image,
                      name: legacyMetadata.metadata.name,
                      description: legacyMetadata.metadata.description.replace(
                        "Legion",
                        "Legacy Legion"
                      ),
                    },
                  }
                : undefined;

              return (
                <Disclosure as="li" key={listing.id}>
                  {({ open }) => (
                    <>
                      <div className="relative">
                        <div className="block px-4 py-4 hover:bg-gray-50 dark:bg-gray-200">
                          <span className="flex items-center">
                            <span className="flex-1 flex space-x-4 truncate">
                              {metadata?.metadata ? (
                                <ImageWrapper
                                  aria-hidden="true"
                                  height="50%"
                                  token={metadata}
                                  width="60%"
                                />
                              ) : (
                                <div className="animate-pulse w-24 bg-gray-300 h-24 rounded-md" />
                              )}
                              <span className="flex flex-col text-gray-500 space-y-1 text-sm truncate">
                                <span className="truncate text-xs text-gray-400 uppercase">
                                  {" "}
                                  {metadata?.metadata?.description ?? ""}
                                </span>
                                <span className="truncate text-gray-600 font-semibold">
                                  {" "}
                                  {metadata?.name ?? ""}
                                </span>
                                <span>
                                  <span className="text-gray-900 font-medium">
                                    {formatPrice(listing.pricePerItem)}
                                  </span>{" "}
                                  $MAGIC
                                </span>
                              </span>
                            </span>
                            {includeStatus ? (
                              getListingStatus(listing) === "Sold" ? (
                                <ShoppingCartIcon className="flex-shrink-0 h-5 w-5 text-gray-600" />
                              ) : (
                                <CurrencyDollarIcon className="flex-shrink-0 h-5 w-5 text-gray-600" />
                              )
                            ) : null}
                            {open ? (
                              <ChevronDownIcon
                                className="flex-shrink-0 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <ChevronRightIcon
                                className="flex-shrink-0 h-5 w-5 text-gray-400"
                                aria-hidden="true"
                              />
                            )}
                          </span>
                        </div>
                        <Disclosure.Button className="absolute inset-0 focus:outline-none w-full h-full" />
                      </div>
                      <Transition show={open} as={Fragment}>
                        <Disclosure.Panel
                          static
                          className="block px-4 dark:bg-gray-200 text-gray-700"
                        >
                          <div className="pb-4 flex sm:space-y-0 space-y-2 sm:flex-row flex-col sm:divide-x-[1px] divide-gray-400 text-sm">
                            <Link
                              href={`/collection/${slugOrAddress}/${listing.token.tokenId}`}
                              passHref
                            >
                              <a className="text-red-500 hover:text-red-700 dark:text-gray-200 dark:hover:text-gray-300 text-sm flex items-center space-x-1">
                                View item
                              </a>
                            </Link>
                            <div className="space-y-1 sm:pr-8">
                              <p className="text-xs dark:text-gray-500">
                                From:
                              </p>
                              <p>{shortenAddress(listing.seller.id)}</p>
                            </div>
                            <div className="sm:px-8 space-y-1">
                              <p className="text-xs dark:text-gray-500">To:</p>
                              <p>{shortenAddress(listing.buyer?.id ?? "")}</p>
                            </div>
                            <div className="sm:pl-8 space-y-1">
                              <p className="text-xs dark:text-gray-500">
                                Time:
                              </p>
                              <a
                                className="flex items-center"
                                href={listing.transactionLink ?? ""}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {formatDistanceToNow(
                                  new Date(
                                    Number(listing.blockTimestamp) * 1000
                                  ),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                                <ExternalLinkIcon className="h-4 m-[0.125rem] pl-1" />
                              </a>
                            </div>
                          </div>
                        </Disclosure.Panel>
                      </Transition>
                    </>
                  )}
                </Disclosure>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Listings;
