import * as React from "react";
import { Disclosure } from "@headlessui/react";
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FilterIcon,
  ShoppingCartIcon,
  SwitchHorizontalIcon,
} from "@heroicons/react/solid";
import { MinusSmIcon, PlusSmIcon } from "@heroicons/react/outline";
import ImageWrapper from "../../../components/ImageWrapper";
import {
  Arbitrum,
  shortenAddress,
  shortenIfAddress,
  useEthers,
  addressEqual,
} from "@usedapp/core";
import Link from "next/link";
import { useInfiniteQuery, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import { marketplace } from "../../../lib/client";
import { AddressZero } from "@ethersproject/constants";
import { useCollection, useMetadata, useTransferNFT } from "../../../lib/hooks";
import { CenterLoadingDots } from "../../../components/CenterLoadingDots";
import {
  formatNumber,
  formatPercent,
  formatPrice,
  formattable,
} from "../../../utils";
import {
  GetTokenDetailsQuery,
  GetTokenExistsInWalletQuery,
  Listing_OrderBy,
  OrderDirection,
  Status,
  TokenStandard,
} from "../../../../generated/marketplace.graphql";
import { formatDistanceToNow } from "date-fns";
import classNames from "clsx";
import { useInView } from "react-intersection-observer";
import { useMagic } from "../../../context/magicContext";
import { formatEther } from "ethers/lib/utils";
import Button from "../../../components/Button";
import { Modal } from "../../../components/Modal";
import { BigNumber } from "@ethersproject/bignumber";
import { Contracts } from "../../../const";
import { NormalizedMetadata, targetNftT } from "../../../types";
import { Tooltip } from "../../../components/Tooltip";
import { utils } from "ethers";
import { EthIcon, SwapIcon, UsdIcon } from "../../../components/Icons";
import { useDebounce } from "use-debounce";
import { SortMenu } from "../../../components/SortMenu";
import { PurchaseItemModal } from "../../../components/PurchaseItemModal";
import { CurrencySwitcher } from "../../../components/CurrencySwitcher";

const MAX_ITEMS_PER_PAGE = 10;

const sortOptions = [
  {
    name: "Price: Low to High",
    direction: OrderDirection.asc,
    value: Listing_OrderBy.pricePerItem,
  },
  {
    name: "Price: High to Low",
    direction: OrderDirection.desc,
    value: Listing_OrderBy.pricePerItem,
  },
  {
    name: "Quantity: Low to High",
    direction: OrderDirection.asc,
    value: Listing_OrderBy.quantity,
  },
  {
    name: "Quantity: High to Low",
    direction: OrderDirection.desc,
    value: Listing_OrderBy.quantity,
  },
  {
    name: "Latest",
    value: Listing_OrderBy.blockTimestamp,
    direction: OrderDirection.desc,
  },
];

// const getRarity = (rank: number) => {
//   if (rank >= 0 && rank <= 50) {
//     return "Rare AF";
//   }

//   if (rank >= 51 && rank <= 300) {
//     return "Super Rare";
//   }

//   if (rank >= 301 && rank <= 3000) {
//     return "Looks Rare";
//   }

//   if (rank >= 3001 && rank <= 4000) {
//     return "Uncommon";
//   }

//   return "Common";
// };

export default function TokenDetail() {
  const router = useRouter();
  const { account } = useEthers();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = React.useState(0);
  const [debouncedQuantity] = useDebounce(quantity, 300);
  const [isFilterOpen, toggleFilterOpen] = React.useReducer(
    (state: boolean) => !state,
    false
  );

  const { address: slugOrAddress, tokenId } = router.query;
  const [modalProps, setModalProps] = React.useState<{
    isOpen: boolean;
    targetNft: targetNftT | null;
  }>({
    isOpen: false,
    targetNft: null,
  });
  const [isTransferModalOpen, setTransferModalOpen] =
    React.useState<boolean>(false);
  const { ethPrice } = useMagic();

  const formattedTokenId = Array.isArray(tokenId) ? tokenId[0] : `${tokenId}`;

  const {
    id: formattedAddress,
    name: collectionName,
    slug,
  } = useCollection(slugOrAddress);

  const { data, isLoading, isIdle } = useQuery(
    ["details", formattedAddress, formattedTokenId],
    () =>
      marketplace.getTokenDetails({
        collectionId: formattedAddress,
        tokenId: formattedTokenId,
      }),
    {
      enabled: formattedAddress !== AddressZero && Boolean(formattedTokenId),
      keepPreviousData: true,
    }
  );

  const { data: tokenExistance } = useQuery(
    "tokenExistance",
    () =>
      marketplace.getTokenExistsInWallet({
        collectionId: formattedAddress,
        tokenId: formattedTokenId,
        address: account?.toLowerCase() ?? AddressZero,
      }),
    {
      enabled:
        !!account && data?.collection?.standard === TokenStandard.ERC1155,
      refetchInterval: false,
    }
  );

  const [sortBy, sortDirection] = (
    typeof router.query.sort === "string"
      ? router.query.sort.split(":")
      : [sortOptions[0].value, sortOptions[0].direction]
  ) as [Listing_OrderBy, OrderDirection];

  const {
    data: listingData,
    isLoading: isListingLoading,
    fetchNextPage,
  } = useInfiniteQuery(
    [
      "erc1155Listings",
      formattedAddress,
      formattedTokenId,
      debouncedQuantity,
      sortBy,
      sortDirection,
    ],
    ({ pageParam = 0 }) =>
      marketplace.getERC1155Listings({
        collectionId: formattedAddress,
        tokenId: formattedTokenId,
        quantity: debouncedQuantity,
        sortBy,
        sortDirection,
        skipBy: pageParam,
        first: MAX_ITEMS_PER_PAGE,
      }),
    {
      enabled:
        !!formattedAddress &&
        !!tokenId &&
        data?.collection?.standard === TokenStandard.ERC1155,
      getNextPageParam: (_, pages) => pages.length * MAX_ITEMS_PER_PAGE,
    }
  );

  const hasNextPage =
    listingData?.pages[listingData.pages.length - 1]?.tokens.length &&
    listingData?.pages[listingData.pages.length - 1]?.tokens[0].listings
      ?.length === MAX_ITEMS_PER_PAGE;

  const { ref, inView } = useInView({
    threshold: 0,
  });

  React.useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  React.useEffect(() => {
    // Removing cache because old image remains in the cache, so a blink of the image is seen when doing client-side routing
    const handleRouteChange = () => {
      queryClient.removeQueries("details");
      queryClient.removeQueries("erc1155Listings");
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [queryClient, router]);

  const hasErc1155Listings =
    listingData?.pages[0]?.tokens &&
    listingData?.pages[0]?.tokens[0]?.listings &&
    listingData?.pages[0].tokens[0].listings.length > 0;

  const tokenInfo =
    data && data?.collection?.tokens && data?.collection?.tokens.length > 0
      ? data.collection.tokens[0]
      : null;
  const id = tokenInfo?.id ?? "";

  const {
    allMetadataLoaded,
    data: metadataData,
    getMetadata,
  } = useMetadata(collectionName, {
    id,
    ids: [id],
  });

  const bridgeworldMetadata = metadataData.bridgeworld?.tokens?.[0];
  const smolverseMetadata = metadataData.smolverse?.tokens?.[0];
  const peekabooMetadata = metadataData.shared?.tokens?.[0];
  const realmMetadata = metadataData.realm?.[0];
  const tokenMetadata = metadataData.token?.token?.metadata ?? undefined;

  const metadata = getMetadata(
    metadataData.battlefly,
    bridgeworldMetadata,
    metadataData.founders,
    undefined,
    peekabooMetadata,
    realmMetadata,
    smolverseMetadata,
    tokenMetadata
      ? { ...tokenInfo, ...tokenMetadata, name: tokenMetadata.name ?? "", id }
      : undefined
  ) as NormalizedMetadata;

  const attributes = metadata
    ? "attributes" in metadata
      ? (metadata.attributes as {
          attribute: {
            id: string;
            name: string;
            value: string;
            percentage?: string | null;
          };
        }[]) ?? []
      : []
    : [];

  const loading = isLoading || isIdle || !allMetadataLoaded;

  const isYourListing =
    data?.collection?.standard === TokenStandard.ERC721 &&
    addressEqual(
      account ?? AddressZero,
      tokenInfo?.owners?.[0].user.id ?? AddressZero
    );

  const hasErc1155Token =
    tokenExistance?.tokens &&
    tokenExistance.tokens.length > 0 &&
    tokenExistance.tokens[0].owners
      ? tokenExistance.tokens[0].owners[0]
      : null;

  const showTransfer =
    (isYourListing && metadata?.name !== "Recruit") ||
    (data?.collection?.standard === TokenStandard.ERC1155 && hasErc1155Token);

  const closePurchaseModal = React.useCallback(
    () => setModalProps({ isOpen: false, targetNft: null }),
    []
  );

  return (
    <div className="pt-12">
      <div className="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-[96rem] lg:px-8 pt-12">
        {loading && <CenterLoadingDots className="h-96" />}
        {!tokenInfo && !loading && (
          <div className="text-center">
            <h3 className="mt-24 lg:mt-2 text-sm font-medium text-gray-900 dark:text-gray-400">
              Sorry, we couldn&apos;t find this item. 😞
            </h3>
            <Link href={`/collection/${slugOrAddress}`}>
              <a className="mt-7 inline-flex space-x-2 items-center text-red-500 hover:underline dark:text-gray-100">
                <ArrowLeftIcon className="h-4 w-4" />
                <p className="capsize">Back to Collection</p>
              </a>
            </Link>
          </div>
        )}
        {data?.collection && tokenInfo && allMetadataLoaded && (
          <>
            <Link href={`/collection/${slugOrAddress}`} passHref>
              <a className="text-gray-600 dark:text-gray-400 dark:hover:text-gray-500 inline-flex items-center space-x-2 hover:text-gray-800">
                <ArrowLeftIcon className="h-3 w-3" />
                <p className="capsize text-xs">Back to Collection</p>
              </a>
            </Link>
            <div className="lg:grid lg:grid-cols-5 lg:gap-x-8 lg:items-start mt-8">
              <div className="lg:col-span-2">
                <div className="w-full aspect-w-1 aspect-h-1">
                  {metadata ? (
                    <ImageWrapper
                      token={{
                        name: metadata?.name,
                        metadata:
                          metadata?.description && metadata?.image
                            ? {
                                description: metadata.description,
                                image: metadata.image,
                              }
                            : null,
                      }}
                    />
                  ) : null}
                </div>
                {/* hide for mobile */}
                <div className="hidden xl:block">
                  <Disclosure as="div" defaultOpen>
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                            <span
                              className={classNames(
                                open
                                  ? "text-red-700 dark:text-gray-300"
                                  : "text-gray-900 dark:text-gray-600",
                                "text-sm font-medium"
                              )}
                            >
                              Attributes
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusSmIcon
                                  className="block h-6 w-6 text-red-400 dark:text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusSmIcon
                                  className="block h-6 w-6 text-gray-400 dark:text-gray-400 group-hover:text-gray-200"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel as="div">
                          {attributes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {attributes.map(({ attribute }) => {
                                if (attribute.percentage == null) {
                                  return (
                                    <div className="border-2 border-red-400 dark:border-gray-400 rounded-md bg-red-200 dark:bg-gray-300 flex items-center flex-col py-2">
                                      <p className="text-red-700 dark:text-gray-500 text-xs font-light">
                                        {attribute.name}
                                      </p>
                                      <p className="flex-1 flex items-center font-medium dark:text-gray-900">
                                        {formattable(attribute.value)}
                                      </p>
                                    </div>
                                  );
                                }
                                return (
                                  <Link
                                    key={attribute.id}
                                    href={{
                                      pathname: `/collection/${slugOrAddress}`,
                                      query: {
                                        search: new URLSearchParams({
                                          [attribute.name]:
                                            attribute.value.replace(/\/.+/, ""),
                                        }).toString(),
                                      },
                                    }}
                                    passHref
                                  >
                                    <a className="border-2 border-red-400 dark:border-gray-400 rounded-md bg-red-200 dark:bg-gray-300 flex items-center flex-col py-2 hover:shadow-xl shadow-red-500/50">
                                      <p className="text-red-700 dark:text-gray-500 text-xs font-light">
                                        {attribute.name}
                                      </p>
                                      <p className="mt-1 font-medium dark:text-gray-900">
                                        {formattable(attribute.value)}
                                      </p>
                                      <p className="mt-2 text-[0.6rem] sm:text-xs text-gray-600 dark:text-gray-600">
                                        {formatPercent(attribute.percentage)}{" "}
                                        have this trait
                                      </p>
                                    </a>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              No attributes
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
              </div>

              <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0 lg:col-span-3 relative">
                {showTransfer && (
                  <Tooltip content="Transfer NFT" sideOffset={5}>
                    <div className="absolute right-0">
                      <span className="relative z-0 inline-flex shadow-sm rounded-md">
                        <button
                          type="button"
                          className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 bg-white dark:bg-transparent text-sm font-medium text-gray-500 dark:text-gray-200 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-500 dark:focus:border-gray-500"
                          onClick={() => setTransferModalOpen(true)}
                        >
                          <span className="sr-only">Previous</span>
                          <SwitchHorizontalIcon
                            className="h-7 w-7"
                            aria-hidden="true"
                          />
                        </button>
                      </span>
                    </div>
                  </Tooltip>
                )}

                <Link href={`/collection/${slugOrAddress}`}>
                  <a>
                    <h2 className="inline-block text-red-500 dark:text-gray-500 tracking-wide uppercase">
                      {data.collection.name}
                    </h2>
                  </a>
                </Link>
                <div className="mt-3">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-200">
                    {metadata?.name ?? ""}
                  </h2>
                </div>
                {data.collection.standard === TokenStandard.ERC721 &&
                  tokenInfo.owners?.[0] &&
                  account && (
                    <div className="mt-2 text-xs text-gray-400">
                      Owned by:{" "}
                      <span>
                        {isYourListing
                          ? "You"
                          : shortenIfAddress(tokenInfo.owners[0].user.id)}
                      </span>
                    </div>
                  )}

                {tokenInfo.lowestPrice?.length ? (
                  <>
                    <div className="mt-10">
                      <h2 className="sr-only">Price</h2>
                      <p className="text-3xl text-gray-900 dark:text-gray-300">
                        {formatPrice(tokenInfo.lowestPrice[0].pricePerItem)}
                        <span className="ml-2 text-xs dark:text-gray-400">
                          $MAGIC
                        </span>
                      </p>
                      <div className="text-gray-500 text-sm mt-2">
                        ≈{" "}
                        <CurrencySwitcher
                          price={Number(
                            parseFloat(
                              formatEther(tokenInfo.lowestPrice[0].pricePerItem)
                            )
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      {isYourListing ||
                      addressEqual(
                        tokenInfo.lowestPrice[0].seller.id,
                        account ?? AddressZero
                      ) ? (
                        <div className="mt-10 text-sm sm:text-base text-gray-500 dark:text-gray-400">
                          This listing is created by you
                        </div>
                      ) : (
                        <div className="max-w-xs flex-1">
                          <Button
                            className="py-3 px-8 text-base"
                            onClick={() => {
                              if (
                                tokenInfo.lowestPrice &&
                                tokenInfo.lowestPrice.length > 0 &&
                                data.collection?.standard
                              ) {
                                setModalProps({
                                  isOpen: true,
                                  targetNft: {
                                    metadata: {
                                      image: metadata.image ?? "",
                                      name: metadata.name ?? "",
                                      description: metadata.description ?? "",
                                    },
                                    payload: {
                                      ...tokenInfo.lowestPrice[0],
                                      standard: data.collection.standard,
                                      tokenId: tokenInfo.tokenId,
                                    },
                                    slug,
                                    collection: collectionName,
                                  },
                                });
                              }
                            }}
                          >
                            Purchase
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="mt-10 text-gray-500 dark:text-gray-400">
                    This item is currently not for sale
                  </div>
                )}

                {data.collection.standard === TokenStandard.ERC1155 && (
                  <div className="mt-10">
                    <div className="flex items-baseline justify-between">
                      Listings
                      <SortMenu options={sortOptions} />
                    </div>
                    {isListingLoading && <CenterLoadingDots className="h-60" />}
                    {!hasErc1155Listings && !isListingLoading && (
                      <div className="flex flex-col justify-center items-center h-12 mt-4">
                        <h3 className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-200">
                          No listings 😞
                        </h3>
                      </div>
                    )}
                    {hasErc1155Listings && (
                      <div className="flex flex-col relative mt-4">
                        <div className="-my-2 overflow-x-auto mx-0 xl:-mx-8">
                          <div className="py-2 align-middle inline-block min-w-full px-0 xl:px-8">
                            <div className="shadow border-b border-gray-200 rounded-lg overflow-auto max-h-72">
                              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-400">
                                <thead className="bg-gray-50 dark:bg-gray-500 sticky top-0 z-10">
                                  <tr className="h-[4.5rem]">
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-[0.5rem] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap"
                                    >
                                      Unit Price
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell"
                                    >
                                      ETH Unit Price
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-[0.5rem] md:text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                                    >
                                      <div className="flex flex-wrap items-center w-24">
                                        <span>Quantity</span>
                                        <button
                                          type="button"
                                          className="ml-2 text-gray-400 hover:text-gray-500"
                                          onClick={toggleFilterOpen}
                                        >
                                          <span className="sr-only">
                                            Filter quantity
                                          </span>
                                          <FilterIcon
                                            className="w-4 h-4"
                                            aria-hidden="true"
                                          />
                                        </button>
                                        {isFilterOpen ? (
                                          <input
                                            className="outline-none mt-1 py-1 w-full dark:placeholder-gray-400 dark:text-gray-200 relative px-2 inline-flex bg-white dark:bg-black flex-row items-center rounded-md overflow-hidden shadow-sm border border-gray-300 dark:border-gray-500 focus:border-red-500 focus:dark:border-gray-200"
                                            onChange={(event) =>
                                              setQuantity(
                                                Number(event.target.value)
                                              )
                                            }
                                            placeholder="E.g. 10"
                                            type="number"
                                            value={quantity ? quantity : ""}
                                          />
                                        ) : null}
                                      </div>
                                    </th>

                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap tracking-wider hidden lg:table-cell"
                                    >
                                      Expire In
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell"
                                    >
                                      From
                                    </th>
                                    <th scope="col" className="px-6 py-3">
                                      <span className="sr-only">Purchase</span>
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-400 dark:bg-gray-300 relative">
                                  {listingData.pages.map((page, i) => (
                                    <React.Fragment key={i}>
                                      {(page.tokens[0]?.listings ?? []).map(
                                        (listing) => (
                                          <tr key={listing.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-[0.7rem] md:text-sm font-medium text-gray-900">
                                              {formatPrice(
                                                listing.pricePerItem
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-700 hidden lg:table-cell">
                                              ≈{" "}
                                              {formatNumber(
                                                Number(
                                                  parseFloat(
                                                    formatEther(
                                                      listing.pricePerItem
                                                    )
                                                  )
                                                ) * parseFloat(ethPrice)
                                              )}{" "}
                                              ETH
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-[0.7rem] md:text-sm text-gray-500 dark:text-gray-700">
                                              {listing.quantity.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-700 hidden lg:table-cell">
                                              {formatDistanceToNow(
                                                new Date(
                                                  Number(listing.expires)
                                                )
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-700 hidden lg:table-cell">
                                              {shortenAddress(
                                                listing.seller.id
                                              )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                              <Button
                                                disabled={addressEqual(
                                                  listing.seller.id,
                                                  account ?? AddressZero
                                                )}
                                                tooltip={
                                                  addressEqual(
                                                    listing.seller.id,
                                                    account ?? AddressZero
                                                  )
                                                    ? "You cannot purchase your own listing"
                                                    : undefined
                                                }
                                                onClick={() => {
                                                  if (
                                                    data.collection?.standard
                                                  ) {
                                                    setModalProps({
                                                      isOpen: true,
                                                      targetNft: {
                                                        metadata: {
                                                          name:
                                                            metadata.name ?? "",
                                                          description:
                                                            metadata.description ??
                                                            "",
                                                          image:
                                                            metadata.image ??
                                                            "",
                                                        },
                                                        payload: {
                                                          ...listing,
                                                          standard:
                                                            data.collection
                                                              .standard,
                                                          tokenId:
                                                            tokenInfo.tokenId,
                                                        },
                                                        collection:
                                                          collectionName,
                                                        slug,
                                                      },
                                                    });
                                                  }
                                                }}
                                                variant="secondary"
                                              >
                                                Purchase
                                              </Button>
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </React.Fragment>
                                  ))}
                                </tbody>
                              </table>
                              {hasNextPage && (
                                <div ref={ref} className="px-6 py-4">
                                  <CenterLoadingDots />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <section aria-labelledby="details-heading" className="mt-12">
                  <h2 id="details-heading" className="sr-only">
                    Additional details
                  </h2>

                  <Disclosure
                    as="div"
                    defaultOpen
                    className="block xl:hidden border-t"
                  >
                    {({ open }) => (
                      <>
                        <h3>
                          <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                            <span
                              className={classNames(
                                open
                                  ? "text-red-700 dark:text-gray-300"
                                  : "text-gray-900 dark:text-gray-600",
                                "text-sm font-medium"
                              )}
                            >
                              Attributes
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusSmIcon
                                  className="block h-6 w-6 text-red-400 dark:text-gray-400 group-hover:text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusSmIcon
                                  className="block h-6 w-6 text-gray-400 dark:text-gray-400 group-hover:text-gray-200"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel as="div" className="pb-6">
                          {attributes.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {attributes.map(({ attribute }) => {
                                if (attribute.percentage == null) {
                                  return (
                                    <div className="border-2 border-red-400 dark:border-gray-400 rounded-md bg-red-200 dark:bg-gray-300 flex items-center flex-col py-2">
                                      <p className="text-red-700 dark:text-gray-500 text-xs font-light">
                                        {attribute.name}
                                      </p>
                                      <p className="flex-1 flex items-center font-medium dark:text-gray-900">
                                        {formattable(attribute.value)}
                                      </p>
                                    </div>
                                  );
                                }
                                return (
                                  <Link
                                    key={attribute.id}
                                    href={{
                                      pathname: `/collection/${slugOrAddress}`,
                                      query: {
                                        search: new URLSearchParams({
                                          [attribute.name]:
                                            attribute.value.replace(/\/.+/, ""),
                                        }).toString(),
                                      },
                                    }}
                                    passHref
                                  >
                                    <a className="border-2 border-red-400 dark:border-gray-400 rounded-md bg-red-200 dark:bg-gray-300 flex items-center flex-col py-2 hover:shadow-xl shadow-red-500/50">
                                      <p className="text-red-700 dark:text-gray-500 text-xs font-light">
                                        {attribute.name}
                                      </p>
                                      <p className="mt-1 font-medium dark:text-gray-900">
                                        {formattable(attribute.value)}
                                      </p>
                                      <p className="mt-2 text-[0.6rem] sm:text-xs text-gray-600 dark:text-gray-600">
                                        {formatPercent(attribute.percentage)}{" "}
                                        have this trait
                                      </p>
                                    </a>
                                  </Link>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400">
                              No attributes
                            </div>
                          )}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  <div className="border-t dark:border-gray-400 divide-y divide-gray-200 dark:divide-gray-400">
                    <Disclosure as="div" defaultOpen>
                      {({ open }) => (
                        <>
                          <h3>
                            <Disclosure.Button className="group relative w-full py-6 flex justify-between items-center text-left">
                              <span
                                className={classNames(
                                  open
                                    ? "text-red-700 dark:text-gray-300"
                                    : "text-gray-900 dark:text-gray-600",
                                  "text-sm font-medium"
                                )}
                              >
                                Details
                              </span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusSmIcon
                                    className="block h-6 w-6 text-red-400 dark:text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <PlusSmIcon
                                    className="block h-6 w-6 text-gray-400 dark:text-gray-400 group-hover:text-gray-200"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel as="div">
                            <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 pb-6">
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Contract ID
                                </dt>
                                <dd className="mt-1">
                                  <a
                                    href={Arbitrum.getExplorerAddressLink(
                                      formattedAddress.slice(0, 42)
                                    )}
                                    className="text-red-500 hover:text-red-700 dark:text-gray-200 dark:hover:text-gray-300 text-sm flex items-center space-x-1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <p>
                                      {shortenIfAddress(
                                        formattedAddress.slice(0, 42)
                                      )}
                                    </p>
                                    <ExternalLinkIcon className="h-4 w-4" />
                                  </a>
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Token ID
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                                  {formattedTokenId}
                                </dd>
                              </div>
                              <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">
                                  Token Standard
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                                  {data.collection?.standard}
                                </dd>
                              </div>
                              {data.collection?.standard ===
                              TokenStandard.ERC1155 ? (
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500">
                                    Items
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-300">
                                    {data.collection?.tokens?.[0].stats?.items.toLocaleString()}
                                  </dd>
                                </div>
                              ) : null}
                            </div>
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
                                  open
                                    ? "text-red-700 dark:text-gray-300"
                                    : "text-gray-900 dark:text-gray-600",
                                  "text-sm font-medium"
                                )}
                              >
                                Item Activity
                              </span>
                              <span className="ml-6 flex items-center">
                                {open ? (
                                  <MinusSmIcon
                                    className="block h-6 w-6 text-red-400 dark:text-gray-400 group-hover:text-gray-500"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <PlusSmIcon
                                    className="block h-6 w-6 text-gray-400 dark:text-gray-400 group-hover:text-gray-200"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                            </Disclosure.Button>
                          </h3>
                          <Disclosure.Panel as="div">
                            <div className="flow-root">
                              <ul
                                role="list"
                                className="-mb-8 overflow-auto max-h-96"
                              >
                                {!tokenInfo.listings ||
                                  (tokenInfo.listings.length === 0 && (
                                    <p className="mt-1 text-sm text-gray-900">
                                      No Timeline Available
                                    </p>
                                  ))}
                                {tokenInfo.listings &&
                                  tokenInfo.listings.map(
                                    (listing, listingIdx) => (
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
                                                  case Status.Active:
                                                    return (
                                                      <span className="bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                                                        <ShoppingCartIcon
                                                          className="h-5 w-5 text-white"
                                                          aria-hidden="true"
                                                        />
                                                      </span>
                                                    );
                                                  case Status.Sold:
                                                    return (
                                                      <span className="bg-red-500 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
                                                        <CurrencyDollarIcon
                                                          className="h-5 w-5 text-white"
                                                          aria-hidden="true"
                                                        />
                                                      </span>
                                                    );
                                                  case Status.Inactive:
                                                    return (
                                                      <span className="bg-gray-400 h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
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
                                                <p className="text-xs lg:text-sm text-gray-500">
                                                  {timelineContent(listing)}
                                                </p>
                                              </div>
                                              <div className="text-right text-xs lg:text-sm whitespace-nowrap text-gray-500">
                                                {formatDistanceToNow(
                                                  new Date(
                                                    Number(
                                                      listing.blockTimestamp
                                                    ) * 1000
                                                  ),
                                                  {
                                                    addSuffix: true,
                                                  }
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  )}
                              </ul>
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
      {tokenInfo && data?.collection?.standard && (
        <TransferNFTModal
          address={formattedAddress}
          isOpen={isTransferModalOpen}
          onClose={() => setTransferModalOpen(false)}
          title={metadata?.name ?? ""}
          token={hasErc1155Token}
          standard={data.collection.standard}
        />
      )}
      {modalProps.isOpen && modalProps.targetNft && (
        <PurchaseItemModal
          address={formattedAddress}
          isOpen={true}
          onClose={closePurchaseModal}
          targetNft={modalProps.targetNft}
        />
      )}
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
          {shortenIfAddress(listing.seller.id)} sold to{" "}
          {listing.buyer?.id ? shortenIfAddress(listing.buyer.id) : "Unknown"}{" "}
          for{" "}
          <span className="font-medium text-gray-900 dark:text-gray-300">
            {formatPrice(listing.pricePerItem)}
          </span>{" "}
          $MAGIC
        </p>
      );
    case Status.Active:
      return (
        <p>
          {shortenIfAddress(listing.seller.id)} listed this item for{" "}
          <span className="font-medium text-gray-900 dark:text-gray-300">
            {formatPrice(listing.pricePerItem)}
          </span>{" "}
          $MAGIC
        </p>
      );
    case Status.Inactive:
      return (
        <p>
          {shortenIfAddress(listing.seller.id)} inactivated a listing of this
          item
        </p>
      );
  }
};

const TransferNFTModal = ({
  address,
  isOpen,
  onClose,
  title,
  token,
  standard,
}: {
  address: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  token:
    | Exclude<
        Exclude<
          GetTokenExistsInWalletQuery["tokens"],
          null | undefined
        >[number]["owners"],
        null | undefined
      >[number]
    | null;
  standard: TokenStandard;
}) => {
  const [quantity, setQuantity] = React.useState(1);
  const [recipientAddress, setRecipientAddress] = React.useState("");
  const router = useRouter();

  const { account } = useEthers();
  const { tokenId } = router.query;

  const normalizedTokenId = Array.isArray(tokenId)
    ? tokenId[0]
    : tokenId ?? "0";

  const { send: transfer, state: transferState } = useTransferNFT(
    address.slice(0, 42),
    standard
  );

  React.useEffect(() => {
    if (transferState.status === "Success") {
      router.reload();
    }
  }, [router, transferState.status]);

  const tokenQuantityLeft =
    standard === TokenStandard.ERC1155 && token?.quantity;

  return (
    <Modal onClose={onClose} isOpen={isOpen} title={`Transfer ${title}`}>
      {tokenQuantityLeft && (
        <>
          <div className="mt-6 text-xs text-gray-700 dark:text-gray-300">
            <p>Quantity</p>
          </div>
          <div className="mt-2 text-sm">
            <label htmlFor="quantity" className="sr-only">
              Quantity
            </label>
            <select
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-select rounded-md border dark:text-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 dark:focus:ring-gray-300 dark:focus:border-gray-300 text-base font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm w-full"
            >
              {Array.from({
                length: Number(tokenQuantityLeft) || 0,
              }).map((_, idx) => (
                <option key={idx} value={idx + 1}>
                  {idx + 1}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="mt-6 text-xs text-gray-700 dark:text-gray-300">
        <p>Wallet Address to Transfer</p>
      </div>
      <div className="mt-2 sm:flex sm:items-center">
        <div className="w-full">
          <label htmlFor="address" className="sr-only">
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="form-input focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 rounded-md disabled:opacity-30 disabled:pointer-events-none"
            placeholder="e.g. 0x00..."
          />
        </div>
      </div>
      <Button
        className="mt-6 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm disabled:opacity-30 disabled:pointer-events-none"
        isLoading={transferState.status === "Mining"}
        loadingText="Transferring NFT..."
        disabled={!utils.isAddress(recipientAddress)}
        onClick={() => {
          if (account) {
            standard === TokenStandard.ERC721
              ? transfer(account, recipientAddress, normalizedTokenId)
              : transfer(account, recipientAddress, tokenId, quantity, 0x0);
          }
        }}
      >
        Transfer
      </Button>
    </Modal>
  );
};
