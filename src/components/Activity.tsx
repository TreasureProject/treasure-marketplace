import {
  ChevronDownIcon,
  ExternalLinkIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
} from "@heroicons/react/solid";
import { CurrencyDollarIcon } from "@heroicons/react/outline";
import { Fragment, useMemo } from "react";
import {
  ListingFieldsFragment,
  Listing_OrderBy,
  OrderDirection,
  Status,
} from "../../generated/marketplace.graphql";
import { Transition } from "@headlessui/react";
import { formatDistanceToNow } from "date-fns";
import { formatPrice, getCollectionSlugFromName } from "../utils";
import {
  useBattleflyMetadata,
  useCollection,
  useCollections,
  useFoundersMetadata,
} from "../lib/hooks";
import { shortenAddress, useEthers } from "@usedapp/core";
import { useRouter } from "next/router";
import ImageWrapper from "./ImageWrapper";
import { Disclosure } from "@headlessui/react";
import Link from "next/link";
import { useQueries, useQuery } from "react-query";
import {
  bridgeworld,
  client,
  marketplace,
  metadata,
  realm,
  smolverse,
} from "../lib/client";
import {
  BridgeworldItems,
  METADATA_COLLECTIONS,
  smolverseItems,
} from "../const";
import { SortMenu } from "./SortMenu";
import { CenterLoadingDots } from "./CenterLoadingDots";

const sortOptions = [
  {
    name: "Latest",
    value: Listing_OrderBy.blockTimestamp,
    direction: OrderDirection.desc,
  },
  {
    name: "Highest Price",
    value: Listing_OrderBy.pricePerItem,
    direction: OrderDirection.desc,
  },
];

type ListingProps = {
  title?: string;
  includeStatus?: boolean;
};

export function Activity({ title, includeStatus }: ListingProps) {
  const router = useRouter();
  const { address: slugOrAddress } = router.query;
  const { account } = useEthers();

  const { id: collection } = useCollection(slugOrAddress);
  const [orderBy, orderDirection] = (
    typeof router.query.sort === "string"
      ? router.query.sort.split(":")
      : [sortOptions[0].value, sortOptions[0].direction]
  ) as [Listing_OrderBy, OrderDirection];

  const isAllActivity = router.pathname.startsWith("/activity");
  const isMyActivity = router.pathname.startsWith("/inventory");
  const wallet = account?.toLowerCase();

  const queries = useQueries([
    {
      queryKey: ["activity", collection, orderBy, orderDirection],
      queryFn: () =>
        marketplace.getActivity({
          filter: {
            status: Status.Sold,
            ...(collection ? { collection } : {}),
          },
          first: 100,
          orderBy,
          orderDirection,
        }),
      enabled: isAllActivity ? !isMyActivity : !!collection,
    },
    {
      queryKey: ["my-buy-activity", wallet],
      queryFn: () =>
        marketplace.getActivity({
          filter: {
            status: Status.Sold,
            buyer: wallet,
          },
          first: 50,
          orderBy,
          orderDirection,
        }),
      enabled: isMyActivity ? !!account : false,
      refetchInterval: 30_000,
    },
    {
      queryKey: ["my-sold-activity", wallet],
      queryFn: () =>
        marketplace.getActivity({
          filter: {
            status: Status.Sold,
            seller: wallet,
          },
          first: 50,
          orderBy,
          orderDirection,
        }),
      enabled: isMyActivity ? !!account : false,
      refetchInterval: 30_000,
    },
  ]);

  const activities: ListingFieldsFragment[] = useMemo(() => {
    if (!isMyActivity) {
      return queries[0].data?.listings ?? [];
    }

    return (
      queries
        .slice(1)
        .flatMap((query) => query.data?.listings ?? [])
        // We have to re-sort to handle the merging of bought and sold.
        .sort((left, right) => right[orderBy] - left[orderBy])
    );
  }, [isMyActivity, orderBy, queries]);

  const collections = useCollections();

  const {
    tokens,
    battleflyTokens,
    bridgeworldTokens,
    foundersTokens,
    smolverseTokens,
    metadataTokens,
    realmTokens,
  } = useMemo(() => {
    return activities.reduce(
      (acc, { collection, token }) => {
        const collectionName =
          collections.find(({ id }) => id === collection.id)?.name ?? "";

        if (BridgeworldItems.includes(collectionName)) {
          acc.bridgeworldTokens.push(token.id);
        } else if (smolverseItems.includes(collectionName)) {
          acc.smolverseTokens.push(token.id);
        } else if (METADATA_COLLECTIONS.includes(collectionName)) {
          acc.metadataTokens.push(token.id);
        } else if (collectionName === "Realm") {
          acc.realmTokens.push(token.id);
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
        metadataTokens: [] as string[],
        realmTokens: [] as string[],
      }
    );
  }, [activities, collections]);

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

  const { data: sharedMetadata } = useQuery(
    ["metadata-shared", metadataTokens],
    () => metadata.getTokenMetadata({ ids: metadataTokens }),
    {
      enabled: metadataTokens.length > 0,
      refetchInterval: false,
    }
  );

  const { data: realmMetadata } = useQuery(
    ["metadata-realm", realmTokens],
    () =>
      realm.getRealmMetadata({
        ids: realmTokens.map((item) => `${parseInt(item.slice(45), 16)}`),
      }),
    {
      enabled: realmTokens.length > 0,
      refetchInterval: false,
    }
  );

  const battleflyMetadata = useBattleflyMetadata(battleflyTokens);
  const foundersMetadata = useFoundersMetadata(foundersTokens);

  if (
    (isMyActivity && queries.slice(1).some((query) => query.isLoading)) ||
    (isAllActivity && queries[0].isLoading)
  ) {
    return <CenterLoadingDots className="h-60" />;
  }

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
                <SortMenu options={sortOptions} />
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
                {activities.map((activity, index) => {
                  const collectionName = collections.find(
                    (item) => item.id === activity?.collection?.id
                  )?.name;
                  const slugOrAddress =
                    getCollectionSlugFromName(collectionName) ??
                    activity.collection.id;

                  const legionsMetadata = legionMetadataData?.tokens.find(
                    (item) => item.id === activity.token.id
                  );
                  const legacyMetadata = metadataData?.tokens.find(
                    (item) => item?.id === activity.token.id
                  );
                  const svMetadata = smolverseMetadata?.tokens.find(
                    (item) => item?.id === activity.token.id
                  );
                  const bfMetadata = battleflyMetadata.data?.find(
                    (item) => item.id === activity.token.id
                  );
                  const fsMetadata = foundersMetadata.data?.find(
                    (item) => item.id === activity.token.id
                  );
                  const shrdMetadata = sharedMetadata?.tokens.find(
                    (item) => item.id === activity.token.id
                  );
                  const rlmMetadata = realmMetadata?.realms.find(
                    (item) => item.id === activity.token.tokenId
                  );

                  const metadata = legionsMetadata
                    ? {
                        id: legionsMetadata.id,
                        name: legionsMetadata.name,
                        tokenId: activity.token.tokenId,
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
                        tokenId: activity.token.tokenId,
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
                        tokenId: activity.token.tokenId,
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
                        tokenId: activity.token.tokenId,
                        metadata: {
                          image: fsMetadata.image ?? "",
                          name: fsMetadata.name,
                          description: collectionName ?? "",
                        },
                      }
                    : shrdMetadata
                    ? {
                        id: shrdMetadata.id,
                        name: shrdMetadata.name,
                        tokenId: activity.token.tokenId,
                        metadata: {
                          image: shrdMetadata.image ?? "",
                          name: shrdMetadata.name,
                          description: collectionName ?? "",
                        },
                      }
                    : rlmMetadata
                    ? {
                        id: rlmMetadata.id,
                        name: `${collectionName} #${activity.token.tokenId}`,
                        tokenId: activity.token.tokenId,
                        metadata: {
                          image: "/img/realm.png",
                          name: `${collectionName} #${activity.token.tokenId}`,
                          description: collectionName ?? "",
                        },
                      }
                    : legacyMetadata?.metadata
                    ? {
                        id: legacyMetadata.id,
                        name: legacyMetadata.name,
                        tokenId: activity.token.tokenId,
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
                      key={activity.id}
                      className={
                        index % 2 === 0
                          ? "bg-white dark:bg-gray-200"
                          : "bg-gray-50 dark:bg-gray-300"
                      }
                    >
                      {includeStatus && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                          {activity.buyer?.id === wallet ? "Bought" : "Sold"}
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
                            href={`/collection/${slugOrAddress}/${activity.token.tokenId}`}
                            passHref
                          >
                            <a className="text-xs text-gray-800 dark:text-gray-700 font-semibold truncate hover:underline">
                              {metadata?.name ?? ""}
                            </a>
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {formatPrice(activity.pricePerItem)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {activity.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {shortenAddress(activity.seller.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                        {shortenAddress(activity.buyer?.id ?? "")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 dark:text-gray-700">
                        <a
                          className="flex flex-1 items-center"
                          href={activity.transactionLink ?? ""}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {formatDistanceToNow(
                            new Date(Number(activity.blockTimestamp) * 1000),
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
            {activities.map((activity) => {
              const collectionName = collections.find(
                (item) => item.id === activity?.collection?.id
              )?.name;
              const slugOrAddress =
                getCollectionSlugFromName(collectionName) ??
                activity.collection.id;

              const legionsMetadata = legionMetadataData?.tokens.find(
                (item) => item.id === activity.token.id
              );
              const legacyMetadata = metadataData?.tokens.find(
                (item) => item?.id === activity.token.id
              );
              const svMetadata = smolverseMetadata?.tokens.find(
                (item) => item?.id === activity.token.id
              );
              const bfMetadata = battleflyMetadata.data?.find(
                (item) => item.id === activity.token.id
              );
              const fsMetadata = foundersMetadata.data?.find(
                (item) => item.id === activity.token.id
              );
              const shrdMetadata = sharedMetadata?.tokens.find(
                (item) => item.id === activity.token.id
              );
              const rlmMetadata = realmMetadata?.realms.find(
                (item) => item.id === activity.token.tokenId
              );

              const metadata = legionsMetadata
                ? {
                    id: legionsMetadata.id,
                    name: legionsMetadata.name,
                    tokenId: activity.token.tokenId,
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
                    tokenId: activity.token.tokenId,
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
                    tokenId: activity.token.tokenId,
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
                    tokenId: activity.token.tokenId,
                    metadata: {
                      image: fsMetadata.image ?? "",
                      name: fsMetadata.name,
                      description: collectionName ?? "",
                    },
                  }
                : shrdMetadata
                ? {
                    id: shrdMetadata.id,
                    name: shrdMetadata.name,
                    tokenId: activity.token.tokenId,
                    metadata: {
                      image: shrdMetadata.image ?? "",
                      name: shrdMetadata.name,
                      description: collectionName ?? "",
                    },
                  }
                : rlmMetadata
                ? {
                    id: rlmMetadata.id,
                    name: `${collectionName} #${activity.token.tokenId}`,
                    tokenId: activity.token.tokenId,
                    metadata: {
                      image: "/img/realm.png",
                      name: `${collectionName} #${activity.token.tokenId}`,
                      description: collectionName ?? "",
                    },
                  }
                : legacyMetadata?.metadata
                ? {
                    id: legacyMetadata.id,
                    name: legacyMetadata.name,
                    tokenId: activity.token.tokenId,
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
                <Disclosure as="li" key={activity.id}>
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
                                    {formatPrice(activity.pricePerItem)}
                                  </span>{" "}
                                  $MAGIC
                                </span>
                              </span>
                            </span>
                            {includeStatus ? (
                              activity.seller?.id === wallet ? (
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
                              href={`/collection/${slugOrAddress}/${activity.token.tokenId}`}
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
                              <p>{shortenAddress(activity.seller.id)}</p>
                            </div>
                            <div className="sm:px-8 space-y-1">
                              <p className="text-xs dark:text-gray-500">To:</p>
                              <p>{shortenAddress(activity.buyer?.id ?? "")}</p>
                            </div>
                            <div className="sm:pl-8 space-y-1">
                              <p className="text-xs dark:text-gray-500">
                                Time:
                              </p>
                              <a
                                className="flex items-center"
                                href={activity.transactionLink ?? ""}
                                rel="noreferrer"
                                target="_blank"
                              >
                                {formatDistanceToNow(
                                  new Date(
                                    Number(activity.blockTimestamp) * 1000
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
}
