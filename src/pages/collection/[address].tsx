import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, SearchIcon } from "@heroicons/react/solid";

import { useInfiniteQuery, useQuery } from "react-query";
import client from "../../lib/client";
import { AddressZero } from "@ethersproject/constants";
import { CenterLoadingDots } from "../../components/CenterLoadingDots";
import { formatNumber, generateIpfsLink } from "../../utils";
import { formatEther } from "ethers/lib/utils";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Modal } from "../../components/Modal";
import {
  GetCollectionListingsQuery,
  OrderDirection,
} from "../../../generated/graphql";
import { useMagic } from "../../context/magicContext";
import { BigNumber } from "@ethersproject/bignumber";
import Button from "../../components/Button";
import { useApproveMagic, useBuyItem } from "../../lib/hooks";
import {
  shortenAddress,
  useEthers,
  useTokenAllowance,
} from "@yuyao17/corefork";
import { Contracts } from "../../const";
import classNames from "clsx";
import { useInView } from "react-intersection-observer";

const MAX_ITEMS_PER_PAGE = 42;

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
];

function assertUnreachable(): never {
  throw new Error("Didn't expect to get here");
}

const MapSortToEnum = (sort: string) => {
  switch (sort) {
    case "asc":
      return OrderDirection.Asc;
    case "desc":
      return OrderDirection.Desc;
  }
  return assertUnreachable();
};

const Collection = () => {
  const router = useRouter();
  const { address, sort } = router.query;
  const { account } = useEthers();
  const [searchToken, setSearchToken] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [modalProps, setModalProps] = useState<{
    isOpen: boolean;
    targetNft:
      | (Exclude<
          GetCollectionListingsQuery["collection"],
          null | undefined
        >["listings"][number] & { standard: "ERC721" | "ERC1155" })
      | null;
  }>({
    isOpen: false,
    targetNft: null,
  });

  const sortParam = sort ?? OrderDirection.Asc;

  const { data: collectionData } = useQuery(
    ["collection", address],
    () =>
      client.getCollectionInfo({
        id: Array.isArray(address)
          ? address[0]
          : address?.toLowerCase() ?? AddressZero,
      }),
    {
      enabled: !!address,
    }
  );

  const {
    data: listingData,
    isLoading: isListingLoading,
    fetchNextPage,
  } = useInfiniteQuery(
    ["listings", { address, sortParam, searchParams }],
    ({ queryKey, pageParam = 0 }) =>
      client.getCollectionListings({
        id: Array.isArray(address)
          ? address[0]
          : address?.toLowerCase() ?? AddressZero,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tokenName: queryKey[1].searchParams,
        skipBy: pageParam,
        first: MAX_ITEMS_PER_PAGE,
        orderDirection: sort
          ? MapSortToEnum(Array.isArray(sort) ? sort[0] : sort)
          : OrderDirection.Asc,
      }),
    {
      enabled: !!address,
      getNextPageParam: (_, pages) => pages.length * MAX_ITEMS_PER_PAGE,
    }
  );

  const hasNextPage =
    listingData?.pages[listingData.pages.length - 1]?.collection?.listings
      .length === MAX_ITEMS_PER_PAGE;

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <main>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="py-24 text-center">
          {collectionData?.collection?.name ? (
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
              {collectionData.collection.name}
            </h1>
          ) : (
            <div className="animate-pulse w-56 bg-gray-300 h-12 rounded-md m-auto" />
          )}
        </div>
        <section
          aria-labelledby="filter-heading"
          className="border-t border-gray-200 pt-6"
        >
          <h2 id="filter-heading" className="sr-only">
            Product filters
          </h2>

          <div className="flex items-center justify-between">
            <div className="relative flex items-stretch flex-grow focus-within:z-10 mr-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                className="focus:ring-red-500 focus:border-red-500 focus:ring-2 block w-full rounded-md pl-10 sm:text-sm border-gray-300 placeholder-gray-400 outline-none py-1"
                placeholder="Search name..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearchParams(searchToken);
                  }
                }}
              />
            </div>
            <Menu as="div" className="relative z-10 inline-block text-left">
              <div>
                <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sort
                  <ChevronDownIcon
                    className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
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
                <Menu.Items className="origin-top-left absolute right-0 z-10 mt-2 w-48 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option) => {
                      const active = option.value === sortParam;
                      return (
                        <Menu.Item key={option.name}>
                          {() => (
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
                                "block px-4 py-2 text-sm font-medium text-gray-900",
                                {
                                  "text-red-500": active,
                                }
                              )}
                            >
                              <span>{option.name}</span>
                            </QueryLink>
                          )}
                        </Menu.Item>
                      );
                    })}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </section>
        {isListingLoading && <CenterLoadingDots className="h-60" />}
        {listingData?.pages[0]?.collection?.listings.length === 0 &&
          !isListingLoading && (
            <div className="flex flex-col justify-center items-center h-36">
              <h3 className="mt-2 text-sm font-medium text-gray-900">
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
                  {group.collection?.listings.map((listing) => {
                    const yourItem = account?.toLowerCase() === listing.user.id;
                    return (
                      <li key={listing.id} className="group">
                        <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                          <Image
                            src={
                              listing.token.metadata?.image?.includes("ipfs")
                                ? generateIpfsLink(listing.token.metadata.image)
                                : listing.token.metadata?.image ?? ""
                            }
                            alt={listing.token.metadata?.name ?? ""}
                            layout="fill"
                            className={classNames(
                              "w-full h-full object-center object-fill",
                              {
                                "group-hover:opacity-75": !yourItem,
                              }
                            )}
                          />
                          {!yourItem && (
                            <button
                              type="button"
                              className="absolute inset-0 focus:outline-none"
                              onClick={() =>
                                setModalProps({
                                  isOpen: true,
                                  targetNft: {
                                    ...listing,
                                    standard:
                                      collectionData.collection?.standard ??
                                      "ERC1155",
                                  },
                                })
                              }
                            >
                              <span className="sr-only">
                                View details for {listing.token.metadata?.name}
                              </span>
                            </button>
                          )}
                        </div>
                        <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                          <p className="text-gray-500 font-thin tracking-wide uppercase text-xs">
                            {collectionData.collection?.name}
                          </p>
                          <p>
                            {formatNumber(
                              parseFloat(formatEther(listing.pricePerItem))
                            )}{" "}
                            <span className="text-xs font-light">$MAGIC</span>
                          </p>
                        </div>
                        <div className="flex items-baseline mt-1">
                          <p className="text-xs text-gray-800 font-semibold truncate">
                            {listing.token.metadata?.name}
                          </p>
                          <p className="text-xs text-[0.6rem] ml-auto whitespace-nowrap">
                            <span className="text-gray-500">Expires in:</span>{" "}
                            <span className="font-bold text-gray-700">
                              {formatDistanceToNow(
                                new Date(Number(listing.expires))
                              )}
                            </span>
                          </p>
                        </div>
                        {collectionData.collection?.standard === "ERC1155" && (
                          <div className="flex mt-1 justify-end">
                            <span className="text-gray-600 text-xs text-[0.6rem]">
                              <span className="text-gray-500">Quantity:</span>{" "}
                              <span className="font-bold text-gray-700">
                                {listing.quantity}
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="flex mt-1 justify-end">
                          <span className="text-gray-600 text-xs text-[0.6rem]">
                            <span className="text-gray-500">Owner:</span>{" "}
                            <span className="font-bold text-gray-700">
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
      </div>
      {modalProps.isOpen && modalProps.targetNft && (
        <PurchaseItemModal
          isOpen={true}
          onClose={() => setModalProps({ isOpen: false, targetNft: null })}
          list={modalProps.targetNft}
        />
      )}
    </main>
  );
};

const PurchaseItemModal = ({
  isOpen,
  onClose,
  list,
}: {
  isOpen: boolean;
  onClose: () => void;
  list: Exclude<
    GetCollectionListingsQuery["collection"],
    null | undefined
  >["listings"][number] & { standard: "ERC721" | "ERC1155" };
}) => {
  const [quantity, setQuantity] = useState(1);
  const { account } = useEthers();
  const router = useRouter();
  const { address } = router.query;
  const { magicBalance, magicPrice, setSushiModalOpen } = useMagic();

  const normalizedAddress = Array.isArray(address)
    ? address[0]
    : address ?? AddressZero;

  const totalPrice =
    quantity * Number(parseFloat(formatEther(list.pricePerItem)));

  const canPurchase = magicBalance.gte(
    BigNumber.from(list.pricePerItem).mul(quantity)
  );

  const { send: approve, state: approveState } = useApproveMagic();

  const magicAllowance = useTokenAllowance(
    Contracts[4].magic,
    account ?? AddressZero,
    Contracts[4].marketplace
  );

  const notAllowed = magicAllowance?.isZero() ?? true;

  const { send, state } = useBuyItem();

  useEffect(() => {
    if (state.status === "Success") {
      onClose();
    }
  }, [state.status, onClose]);

  return (
    <Modal onClose={onClose} isOpen={isOpen} title="Order Summary">
      <div className="sm:mt-10 lg:mt-0">
        <div className="sm:mt-4">
          <h3 className="sr-only">Items in your cart</h3>
          <ul role="list" className="divide-y divide-gray-200">
            <li
              key={list.id}
              className="flex flex-col sm:flex-row py-6 px-4 sm:px-6"
            >
              <div className="flex-shrink-0">
                <Image
                  src={
                    list.token.metadata?.image?.includes("ipfs")
                      ? generateIpfsLink(list.token.metadata.image)
                      : list.token.metadata?.image ?? ""
                  }
                  alt={list.token.metadata?.name ?? ""}
                  width="50%"
                  height="50%"
                />
              </div>

              <div className="sm:ml-6 sm:space-y-0 mt-2 sm:mt-0 space-y-2 flex-1 flex flex-col">
                <div className="flex">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm">
                      <p className="text-sm text-gray-500 uppercase">
                        {list.token.metadata?.description}
                      </p>
                      <p className="mt-1 font-medium text-gray-700 hover:text-gray-800">
                        {list.token.metadata?.name ?? ""}
                      </p>
                    </h4>
                  </div>
                </div>

                {list.standard === "ERC1155" && (
                  <div className="flex-1 sm:pt-2 flex items-end justify-between">
                    <p className="mt-1 text-xs font-medium text-gray-900">
                      {formatEther(list.pricePerItem)} $MAGIC{" "}
                      <span className="text-[0.5rem] text-gray-500">
                        Per Item
                      </span>
                    </p>

                    <div className="ml-4">
                      <label htmlFor="quantity" className="sr-only">
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        name="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-select rounded-md border border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      >
                        {Array.from({
                          length: Number(list.quantity) || 0,
                        }).map((_, idx) => (
                          <option key={idx} value={idx + 1}>
                            {idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </li>
          </ul>
          <dl className="py-6 px-4 space-y-6 sm:px-6">
            <div className="flex items-center justify-between border-t border-gray-200 pt-6">
              <dt className="text-base font-medium">Total</dt>
              <dd className="text-base font-medium text-gray-900 flex flex-col items-end">
                <p>{totalPrice} $MAGIC</p>
                <p className="text-gray-500 text-sm mt-1">
                  ≈ ${formatNumber(totalPrice * magicPrice)}
                </p>
              </dd>
            </div>
          </dl>

          <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
            {notAllowed ? (
              <Button
                onClick={approve}
                isLoading={approveState.status === "Mining"}
                loadingText="Approving MAGIC..."
                variant="secondary"
              >
                Approve $MAGIC to purchase this item
              </Button>
            ) : (
              <>
                <Button
                  disabled={!canPurchase || state.status === "Mining"}
                  isLoading={state.status === "Mining"}
                  loadingText="Confirming order..."
                  onClick={() => {
                    send(
                      normalizedAddress,
                      list.user.id,
                      Number(list.token.tokenId),
                      quantity
                    );
                  }}
                >
                  {canPurchase
                    ? "Confirm order"
                    : "You have insufficient funds"}
                </Button>
                {!canPurchase && (
                  <button
                    className="mt-4 text-xs w-full m-auto text-red-500 underline"
                    onClick={() => {
                      onClose();
                      setSushiModalOpen(true);
                    }}
                  >
                    Purchase MAGIC on SushiSwap
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Collection;
