import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";

import { useInfiniteQuery, useQuery } from "react-query";
import client from "../../../lib/client";
import { AddressZero, Zero } from "@ethersproject/constants";
import { CenterLoadingDots } from "../../../components/CenterLoadingDots";
import {
  abbreviatePrice,
  formatNumber,
  formatPrice,
  generateIpfsLink,
} from "../../../utils";
import { formatEther } from "ethers/lib/utils";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Modal } from "../../../components/Modal";
import {
  GetCollectionListingsQuery,
  Listing_OrderBy,
  OrderDirection,
  TokenStandard,
} from "../../../../generated/graphql";
import { shortenAddress, useEthers } from "@yuyao17/corefork";
import classNames from "clsx";
import { useInView } from "react-intersection-observer";
import { SearchAutocomplete } from "../../../components/SearchAutocomplete";
import { Item } from "react-stately";
import Listings from "../../../components/Listings";

const MAX_ITEMS_PER_PAGE = 42;

const tabs = [
  { name: "Collection", value: "collection" },
  { name: "Activity", value: "activity" },
];

function QueryLink(props: any) {
  const { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
}

const sortOptions = [
  { name: "Price: Low to High", value: "asc" },
  { name: "Price: High to Low", value: "desc" },
  { name: "Latest", value: "latest" },
];

function assertUnreachable(): never {
  throw new Error("Didn't expect to get here");
}

const MapSortToOrder = (sort: string) => {
  if (sort === "latest") {
    return Listing_OrderBy.BlockTimestamp;
  }

  return Listing_OrderBy.PricePerItem;
};

const MapSortToEnum = (sort: string) => {
  switch (sort) {
    case "asc":
      return OrderDirection.Asc;
    case "desc":
    case "latest":
      return OrderDirection.Desc;
  }
  return assertUnreachable();
};

const getTotalQuantity = (
  listings: NonNullable<
    NonNullable<GetCollectionListingsQuery["collection"]>["tokens"]
  >[number]["listings"]
) => {
  return listings && listings.length > 0
    ? listings.reduce<number>(
        (acc, listing) => acc + Number(listing.quantity),
        0
      )
    : 0;
};

const Collection = () => {
  const router = useRouter();
  const { address, sort, tab, activitySort } = router.query;
  const { account } = useEthers();
  const [searchParams, setSearchParams] = useState("");
  const [isDetailedFloorPriceModalOpen, setDetailedFloorPriceModalOpen] =
    useState(false);

  const sortParam = sort ?? OrderDirection.Asc;
  const activitySortParam = activitySort ?? "time";
  const formattedAddress = Array.isArray(address)
    ? address[0]
    : address?.toLowerCase() ?? AddressZero;

  const formattedTab = tab ? (Array.isArray(tab) ? tab[0] : tab) : "collection";

  const { data: activityData, isLoading: isActivityLoading } = useQuery(
    ["activity", { address, activitySortParam }],
    () =>
      client.getActivity({
        id: formattedAddress,
        orderBy:
          activitySortParam === "price"
            ? Listing_OrderBy.PricePerItem
            : Listing_OrderBy.BlockTimestamp,
      }),
    {
      enabled: formattedTab === "activity",
    }
  );

  const { data: collectionData } = useQuery(
    ["collection", address],
    () =>
      client.getCollectionInfo({
        id: formattedAddress,
      }),
    {
      enabled: !!address,
      refetchInterval: false,
    }
  );

  const { data: statData } = useQuery(
    ["stats", address],
    () =>
      client.getCollectionStats({
        id: formattedAddress,
      }),
    {
      enabled: !!address,
    }
  );

  const isERC1155 =
    collectionData?.collection?.standard === TokenStandard.Erc1155;

  const {
    data: listingData,
    isLoading: isListingLoading,
    fetchNextPage,
  } = useInfiniteQuery(
    ["listings", { address, sortParam, searchParams }],
    ({ queryKey, pageParam = 0 }) =>
      client.getCollectionListings({
        id: formattedAddress,
        isERC1155,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tokenName: queryKey[1].searchParams,
        skipBy: pageParam,
        first: MAX_ITEMS_PER_PAGE,
        orderBy: sort
          ? MapSortToOrder(Array.isArray(sort) ? sort[0] : sort)
          : Listing_OrderBy.PricePerItem,
        orderDirection: sort
          ? MapSortToEnum(Array.isArray(sort) ? sort[0] : sort)
          : OrderDirection.Asc,
      }),
    {
      enabled: !!address && !!collectionData,
      getNextPageParam: (_, pages) => pages.length * MAX_ITEMS_PER_PAGE,
    }
  );

  // reset searchParams on address change
  useEffect(() => {
    setSearchParams("");
  }, [address]);

  const collection =
    listingData?.pages[listingData.pages.length - 1]?.collection;
  const data = isERC1155 ? collection?.tokens : collection?.listings;

  const hasNextPage = data?.length === MAX_ITEMS_PER_PAGE;

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const listingsWithoutDuplicates =
    statData?.collection?.listings.reduce((acc, curr) => {
      if (curr.token.name && !acc[curr.token.name]) {
        acc[curr.token.name] = formatNumber(
          parseFloat(formatEther(curr.token.floorPrice || Zero))
        );
      }

      return acc;
    }, {}) ?? {};

  return (
    <main>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8 pt-24">
        <div className="py-24 flex flex-col items-center">
          {collectionData?.collection && statData?.collection ? (
            <>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {collectionData.collection.name}
              </h1>
              <div className="mt-12 overflow-hidden flex flex-col">
                <dl className="-mx-8 -mt-8 flex flex-wrap divide-x-2">
                  <div className="flex flex-col px-8 pt-8">
                    <dt className="order-2 text-xs sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2">
                      Floor Price ($MAGIC)
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl">
                      {formatPrice(statData.collection.floorPrice)}
                    </dd>
                  </div>
                  <div className="flex flex-col px-8 pt-8">
                    <dt className="order-2 text-xs sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2">
                      Total Listings
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl">
                      {statData.collection.totalListings}
                    </dd>
                  </div>
                  <div className="flex flex-col px-8 pt-8">
                    <dt className="order-2 text-xs sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2">
                      Volume ($MAGIC)
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl">
                      {abbreviatePrice(statData.collection.totalVolume)}
                    </dd>
                  </div>
                </dl>
                {isERC1155 && statData.collection.totalListings > 0 && (
                  <button
                    className="text-[0.5rem] sm:text-xs block underline place-self-start mt-2 dark:text-gray-300"
                    onClick={() => setDetailedFloorPriceModalOpen(true)}
                  >
                    Compare floor prices &gt;
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="animate-pulse w-56 bg-gray-300 h-12 rounded-md m-auto" />
          )}
        </div>
        <div>
          <div className="block">
            <div className="border-b border-gray-200 dark:border-gray-500">
              <nav
                className="-mb-px flex justify-center space-x-8"
                aria-label="Tabs"
              >
                {tabs.map((tab) => {
                  const isCurrentTab = formattedTab === tab.name.toLowerCase();
                  return (
                    <Link
                      key={tab.name}
                      href={{
                        pathname: router.pathname,
                        query: {
                          ...router.query,
                          tab: tab.value,
                        },
                      }}
                      passHref
                    >
                      <a
                        className={classNames(
                          isCurrentTab
                            ? "border-red-500 text-red-600 dark:border-gray-300 dark:text-gray-300"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-500",
                          "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                        )}
                        aria-current={isCurrentTab ? "page" : undefined}
                      >
                        {tab.name}
                      </a>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
        {formattedTab === "collection" ? (
          <>
            <section aria-labelledby="filter-heading" className="pt-6">
              <h2 id="filter-heading" className="sr-only">
                Product filters
              </h2>

              {statData?.collection && (
                <div className="flex items-center">
                  <div className="mr-2 w-full">
                    <SearchAutocomplete
                      label="Search Item"
                      placeholder="Search Name..."
                      onSelectionChange={(name) =>
                        setSearchParams((name as string | null) ?? "")
                      }
                    >
                      {Object.keys(listingsWithoutDuplicates)
                        .sort()
                        .map((listing) => (
                          <Item key={listing}>{listing}</Item>
                        ))}
                    </SearchAutocomplete>
                  </div>
                  <Menu
                    as="div"
                    className="relative z-20 inline-block text-left"
                  >
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
                            const active = option.value === sortParam;
                            return (
                              <Menu.Item key={option.name}>
                                <QueryLink
                                  href={{
                                    pathname: router.pathname,
                                    query: {
                                      ...router.query,
                                      sort: option.value,
                                    },
                                  }}
                                  passHref
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
              )}
            </section>
            {isListingLoading && <CenterLoadingDots className="h-60" />}
            {data?.length === 0 && !isListingLoading && (
              <div className="flex flex-col justify-center items-center h-36">
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                  No NFTs listed 😞
                </h3>
              </div>
            )}
            {listingData && collectionData && (
              <section aria-labelledby="products-heading" className="my-8">
                <h2 id="products-heading" className="sr-only">
                  {collectionData.collection?.name}
                </h2>
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                >
                  {listingData.pages.map((group, i) => (
                    <React.Fragment key={i}>
                      {/* ERC1155 */}
                      {group.collection?.tokens
                        ?.filter((token) => Boolean(token?.listings?.length))
                        .map((token) => {
                          return (
                            <li key={token.id} className="group">
                              <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                                <Image
                                  src={
                                    token.metadata?.image?.includes("ipfs")
                                      ? generateIpfsLink(token.metadata.image)
                                      : token.metadata?.image ?? ""
                                  }
                                  alt={token.name ?? ""}
                                  layout="fill"
                                  className={
                                    "w-full h-full object-center object-fill group-hover:opacity-75"
                                  }
                                />
                                <Link
                                  href={`/collection/${formattedAddress}/${token.tokenId}`}
                                  passHref
                                >
                                  <a className="absolute inset-0 focus:outline-none">
                                    <span className="sr-only">
                                      View details for {token.name}
                                    </span>
                                  </a>
                                </Link>
                              </div>
                              <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                                <p className="text-gray-500 dark:text-gray-400 font-thin tracking-wide uppercase text-[0.5rem]">
                                  {collectionData.collection?.name}
                                </p>
                                <p className="dark:text-gray-100">
                                  {formatNumber(
                                    parseFloat(
                                      formatEther(
                                        token?.listings?.[0]?.pricePerItem
                                      )
                                    )
                                  )}{" "}
                                  <span className="text-xs font-light">
                                    $MAGIC
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-baseline mt-1">
                                <p className="text-xs text-gray-800 dark:text-gray-50 font-semibold truncate">
                                  {token.name}
                                </p>
                                <p className="text-xs text-[0.6rem] ml-auto whitespace-nowrap">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Listed Items:
                                  </span>{" "}
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {getTotalQuantity(token.listings)}
                                  </span>
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      {/* ERC721 */}
                      {group.collection?.listings?.map((listing) => {
                        const yourItem =
                          account?.toLowerCase() === listing.user.id;
                        return (
                          <li key={listing.id} className="group">
                            <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                              <Image
                                src={
                                  listing.token.metadata?.image?.includes(
                                    "ipfs"
                                  )
                                    ? generateIpfsLink(
                                        listing.token.metadata.image
                                      )
                                    : listing.token.metadata?.image ?? ""
                                }
                                alt={listing.token.name ?? ""}
                                layout="fill"
                                className="w-full h-full object-center object-fill group-hover:opacity-75"
                              />
                              <Link
                                href={`/collection/${formattedAddress}/${listing.token.tokenId}`}
                              >
                                <a className="absolute inset-0 focus:outline-none">
                                  <span className="sr-only">
                                    View details for {listing.token.name}
                                  </span>
                                </a>
                              </Link>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                              <p className="text-gray-500 dark:text-gray-400 font-thin tracking-wide uppercase text-[0.5rem]">
                                {collectionData.collection?.name}
                              </p>
                              <p className="dark:text-gray-100">
                                {formatNumber(
                                  parseFloat(formatEther(listing.pricePerItem))
                                )}{" "}
                                <span className="text-xs font-light">
                                  $MAGIC
                                </span>
                              </p>
                            </div>
                            <div className="flex items-baseline mt-1">
                              <p className="text-xs text-gray-800 dark:text-gray-50 font-semibold truncate">
                                {listing.token.name}
                              </p>
                              <p className="text-xs text-[0.6rem] ml-auto whitespace-nowrap">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Expires in:
                                </span>{" "}
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                  {formatDistanceToNow(
                                    new Date(Number(listing.expires))
                                  )}
                                </span>
                              </p>
                            </div>
                            {isERC1155 && (
                              <div className="flex mt-1 justify-end">
                                <span className="text-gray-600 text-xs text-[0.6rem]">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Quantity:
                                  </span>{" "}
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {listing.quantity}
                                  </span>
                                </span>
                              </div>
                            )}
                            <div className="flex mt-1 justify-end">
                              <span className="text-gray-600 text-xs text-[0.6rem]">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Owner:
                                </span>{" "}
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                  {yourItem
                                    ? "You"
                                    : shortenAddress(listing.user.id)}
                                </span>
                              </span>
                            </div>
                          </li>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </ul>
                {hasNextPage && (
                  <ul
                    role="list"
                    ref={ref}
                    className="mt-10 grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <li key={i}>
                        <div className="animate-pulse w-full bg-gray-300 h-64 rounded-md m-auto" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </>
        ) : (
          <>
            {isActivityLoading && <CenterLoadingDots className="h-60" />}
            {activityData?.collection?.listings && (
              <Listings
                listings={activityData.collection.listings}
                sort={activitySortParam}
              />
            )}
          </>
        )}
      </div>

      {statData?.collection && isDetailedFloorPriceModalOpen && (
        <DetailedFloorPriceModal
          isOpen={true}
          onClose={() => setDetailedFloorPriceModalOpen(false)}
          listingsWithoutDuplicates={listingsWithoutDuplicates}
        />
      )}
    </main>
  );
};

const DetailedFloorPriceModal = ({
  isOpen,
  onClose,
  listingsWithoutDuplicates,
}: {
  isOpen: boolean;
  onClose: () => void;
  listingsWithoutDuplicates: { [key: string]: string };
}) => {
  const [lists, setList] = useState(listingsWithoutDuplicates);

  return (
    <Modal onClose={onClose} isOpen={isOpen} title="Compare floor prices">
      <div className="mt-4">
        <SearchAutocomplete
          placeholder="Search Token..."
          onSelectionChange={(key) => {
            if (!key) {
              setList(listingsWithoutDuplicates);
              return;
            }
            const targetCollection = { [key]: lists[key] };

            setList(targetCollection);
          }}
        >
          {Object.keys(listingsWithoutDuplicates)
            .sort()
            .map((key) => (
              <Item key={key}>{key}</Item>
            ))}
        </SearchAutocomplete>
        <div className="flex flex-col mt-2">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="overflow-auto dark:divide-gray-400 rounded-md max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-500 sticky top-0">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Token
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Floor Price ($MAGIC)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(lists)
                      .sort()
                      .map((list, listIdx) => {
                        const floorPrice = lists[list];
                        return (
                          <tr
                            key={list}
                            className={
                              listIdx % 2 === 0
                                ? "bg-white dark:bg-gray-200"
                                : "bg-gray-50 dark:bg-gray-300"
                            }
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-700">
                              {list}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-700">
                              {floorPrice}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Collection;
