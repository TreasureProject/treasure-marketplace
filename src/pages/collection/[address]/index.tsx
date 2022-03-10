import Router, { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import {
  ChevronDownIcon,
  FilterIcon,
  InformationCircleIcon,
  MinusSmIcon,
  PlusSmIcon,
  XIcon,
  ViewGridIcon,
} from "@heroicons/react/solid";
import LargeGridIcon from "../../../components/LargeGridIcon";

import { useInfiniteQuery, useQuery } from "react-query";
import {
  bridgeworld,
  client,
  marketplace,
  smolverse,
} from "../../../lib/client";
import { Zero } from "@ethersproject/constants";
import { CenterLoadingDots } from "../../../components/CenterLoadingDots";
import {
  abbreviatePrice,
  formatNumber,
  formatPercent,
  formatPrice,
  getPetsMetadata,
} from "../../../utils";
import { formatEther } from "ethers/lib/utils";
import ImageWrapper from "../../../components/ImageWrapper";
import Link from "next/link";
import { Modal } from "../../../components/Modal";
import { GetCollectionAttributesQuery } from "../../../../generated/queries.graphql";
import {
  GetCollectionListingsQuery,
  Listing_OrderBy,
  OrderDirection,
  Status,
  TokenStandard,
} from "../../../../generated/marketplace.graphql";
import classNames from "clsx";
import { useInView } from "react-intersection-observer";
import { SearchAutocomplete } from "../../../components/SearchAutocomplete";
import { Item } from "react-stately";
import Listings from "../../../components/Listings";
import Button from "../../../components/Button";
import {
  useBattleflyMetadata,
  useCollection,
  useFoundersMetadata,
} from "../../../lib/hooks";
import { EthIcon, MagicIcon, SwapIcon } from "../../../components/Icons";
import { useMagic } from "../../../context/magicContext";
import { BridgeworldItems, smolverseItems } from "../../../const";
import * as Popover from "@radix-ui/react-popover";
import { normalizeBridgeworldTokenMetadata } from "../../../utils/metadata";

const MAX_ITEMS_PER_PAGE = 42;

const ROLES = [
  "Siege",
  "Fighter",
  "Assassin",
  "Ranged",
  "Spellcaster",
  "Riverman",
  "Numeraire",
  "All-Class",
  "Origin",
];

const AUX_ROLES = ROLES.slice(0, 5);

const RARITY = ["Legendary", "Rare", "Uncommon", "Special", "Common"];

const AUX_RARITY = ["Rare", "Uncommon", "Common"];

const FATIGUE = ["Yes", "No"];

const SUMMONS = ["0", "1", "2"];
const BOOST = ["0.05", "0.1", "0.25", "0.5", "0.75", "1.0", "2.0", "6.0"];
const LEVELS = ["1", "2", "3", "4", "5", "6"];
const XPS = Array(20)
  .fill("")
  .map((_, index) => `>= ${index * 10}`);

const CATEGORY = [
  "Alchemy",
  "Arcana",
  "Brewing",
  "Enchanter",
  "Leatherworking",
  "Smithing",
];
const TIERS = LEVELS.slice(0, 5);

const generateDescription = (collectionName: string) => {
  switch (collectionName) {
    case "Unpilgrimaged Legion Genesis":
    case "Unpilgrimaged Legion Auxiliary":
      return (
        <p className="text-gray-500 dark:text-gray-400 text-[0.5rem] sm:text-sm mt-4 sm:mt-6">
          Unpilgrimaged Legions need to undergo{" "}
          <a
            href="https://bridgeworld.treasure.lol/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Pilgrimage
          </a>{" "}
          to participate in Bridgeworld.
        </p>
      );
    default:
      return "";
  }
};

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

const sortToField = (sort: string) => {
  if (sort === "latest") {
    return Listing_OrderBy.blockTimestamp;
  }

  return Listing_OrderBy.pricePerItem;
};

const sortToDirection = (sort: string) => {
  switch (sort) {
    case "asc":
      return OrderDirection.asc;
    case "desc":
    case "latest":
      return OrderDirection.desc;
  }
  return assertUnreachable();
};

const getTotalQuantity = (
  listings: NonNullable<
    NonNullable<GetCollectionListingsQuery>["tokens"]
  >[number]["listings"]
) => {
  return listings && listings.length > 0
    ? listings.reduce<number>(
        (acc, listing) => acc + Number(listing.quantity),
        0
      )
    : 0;
};

const reduceAttributes = (
  attributes: NonNullable<
    GetCollectionAttributesQuery["collection"]
  >["attributes"]
): {
  [key: string]: { value: string; percentage: string }[];
} | null => {
  return attributes && attributes.length > 0
    ? attributes.reduce<{
        [key: string]: { value: string; percentage: string }[];
      }>((acc, attribute) => {
        if (!acc[attribute.name]) {
          acc[attribute.name] = [
            {
              value: attribute.value,
              percentage: attribute.percentage,
            },
          ];
          return acc;
        }
        acc[attribute.name] = [
          ...acc[attribute.name],
          {
            value: attribute.value,
            percentage: attribute.percentage,
          },
        ];
        return acc;
      }, {})
    : null;
};

const formatSearchFilter = (search: string | undefined) => {
  if (!search) return [];

  const searchParams = Array.from(new URLSearchParams(search).entries());

  /*
    if searchParams is like this: [["Background", "red,blue"], ["Color", "green"]]
    return an array like this: ["Background,red", "Background,blue"]
  */
  return searchParams.reduce<string[]>((acc, [key, value]) => {
    const values = value.split(",");
    return [...acc, ...values.map((v) => `${key},${v}`)];
  }, []);
};

const getInititalFilters = (search: string | undefined) => {
  if (!search) return {};
  const searchParams = Array.from(new URLSearchParams(search).entries());

  /*
    if searchParams is like this: Background=alley
    return an object like this: {
      Background: ["alley"]
    }
    if searchParams is undefined, return an empty object
  */
  return searchParams.reduce<{ [key: string]: string[] }>(
    (acc, [key, value]) => {
      if (!acc[key]) {
        acc[key] = [value];
        return acc;
      }
      acc[key] = [...acc[key], value];
      return acc;
    },
    {}
  );
};

const createFilter = (
  base: string | undefined,
  search: {
    key: string;
    value: string;
  }
) => {
  const searchParams = Array.from(new URLSearchParams(base).entries());

  const combined = searchParams.reduce<{ [key: string]: string[] }>(
    (acc, [key, value]) => {
      if (!acc[key]) {
        acc[key] = [value];
        return acc;
      }
      acc[key] = [...acc[key], value];
      return acc;
    },
    {}
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new URLSearchParams({
    ...combined,
    [search.key]: [...(combined?.[search.key] ?? []), search.value],
  }).toString();
};

const removeFilter = (
  base: string | undefined,
  search: { key: string; value: string }
) => {
  const searchParams = Array.from(new URLSearchParams(base).entries());

  const combined = searchParams.reduce<{ [key: string]: string[] }>(
    (acc, [key, value]) => {
      if (!acc[key]) {
        acc[key] = [value];
        return acc;
      }
      acc[key] = [...acc[key], value];
      return acc;
    },
    {}
  );

  const values = combined[search.key] ?? [];
  const filteredValues = values[0]
    ?.split(",")
    .filter((v) => v !== search.value);
  if (!filteredValues || filteredValues.length === 0) {
    delete combined[search.key];
  } else {
    combined[search.key] = [filteredValues.join(",")];
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new URLSearchParams(combined).toString();
};

const unique = <T,>(array: T[]) => Array.from(new Set(array));

const Collection = () => {
  const router = useRouter();
  const {
    address: slugOrAddress,
    sort,
    tab,
    activitySort,
    search,
  } = router.query;
  const formattedSearch = Array.isArray(search) ? search[0] : search;
  const [searchToken, setSearchToken] = useState("");
  const [searchParams, setSearchParams] = useState("");
  const [isDetailedFloorPriceModalOpen, setDetailedFloorPriceModalOpen] =
    useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [floorCurrency, setFloorCurrency] = useState<"magic" | "eth">("magic");
  const [toggleGrid, setToggleGrid] = useState(false);
  const filters = getInititalFilters(formattedSearch);
  const { ethPrice } = useMagic();

  const sortParam = Array.isArray(sort) ? sort[0] : sort ?? OrderDirection.asc;
  const activitySortParam = activitySort ?? "time";
  const { id: formattedAddress, name: collectionName } =
    useCollection(slugOrAddress);

  const formattedTab = tab ? (Array.isArray(tab) ? tab[0] : tab) : "collection";

  const isBridgeworldItem = BridgeworldItems.includes(collectionName);
  const isSmolverseItem = smolverseItems.includes(collectionName);
  const isTreasure = collectionName === "Treasures";
  const isBattleflyItem = collectionName === "BattleFly";
  const isFoundersItem = collectionName.includes("Founders");

  // This is a faux collection with only recruits. Which are not sellable. Redirect to Legion Auxiliary collection.
  if (collectionName === "Legions") {
    router.replace("/collection/legion-auxiliary");
  }

  const { data: activityData, isLoading: isActivityLoading } = useQuery(
    ["activity", { formattedAddress, activitySortParam }],
    () =>
      marketplace.getActivity({
        id: formattedAddress,
        orderBy:
          activitySortParam === "price"
            ? Listing_OrderBy.pricePerItem
            : Listing_OrderBy.blockTimestamp,
      }),
    {
      enabled: formattedTab === "activity",
    }
  );

  const { data: collectionData } = useQuery(
    ["collection-info", formattedAddress],
    () =>
      marketplace.getCollectionInfo({
        id: formattedAddress,
      }),
    {
      enabled: !!formattedAddress,
      refetchInterval: false,
    }
  );

  const { data: collectionAttributesData } = useQuery(
    ["collection-attributes", formattedAddress],
    () =>
      client.getCollectionAttributes({
        id: formattedAddress,
      }),
    {
      enabled: !!formattedAddress,
      refetchInterval: false,
    }
  );
  const treasureBoosts = useQuery(
    ["treasure-boosts"],
    () => bridgeworld.getTreasureBoosts(),
    {
      enabled: isTreasure,
      refetchInterval: false,
      select: (data) => unique(data.treasureInfos.map((item) => item.boost)),
    }
  );
  const battleflyAttributes = useQuery(
    ["battlefly-attributes"],
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_BATTLEFLY_API}/battleflies/attributes`
      ).then((res) => res.json()),
    {
      enabled: isBattleflyItem,
      refetchInterval: false,
      select: (data) =>
        data.reduce((acc, { name, values }) => {
          values.forEach(({ value }) => {
            acc.push({ name, value, percentage: null });
          });

          return acc;
        }, []),
    }
  );

  const attributeFilterList = React.useMemo(() => {
    switch (true) {
      case collectionName === "Treasures":
        return {
          "Atlas Mine Boost":
            treasureBoosts.data?.map((value) => ({
              value: formatPercent(value),
              percentage: null,
            })) ?? [],
          Category: CATEGORY.map((value) => ({ value, percentage: null })),
          Tier: TIERS.map((value) => ({ value, percentage: null })),
        };
      case collectionName.startsWith("Legion"):
        return {
          Role: (collectionName.includes("Genesis") ? ROLES : AUX_ROLES).map(
            (value) => ({ value, percentage: null })
          ),
          Rarity: (collectionName.includes("Genesis")
            ? RARITY
            : AUX_RARITY
          ).map((value) => ({ value, percentage: null })),
          "Summon Fatigue": (collectionName.includes("Genesis")
            ? []
            : FATIGUE
          ).map((value) => ({
            value,
            percentage: null,
          })),
          "Times Summoned": SUMMONS.map((value) => ({
            value,
            percentage: null,
          })),
          "Atlas Mine Boost": BOOST.map((value) => ({
            value: formatPercent(value),
            percentage: null,
          })),
          "Crafting Level": LEVELS.map((value) => ({
            value,
            percentage: null,
          })),
          "Crafting XP": XPS.map((value) => ({ value, percentage: null })),
          "Questing Level": LEVELS.map((value) => ({
            value,
            percentage: null,
          })),
          "Questing XP": XPS.map((value) => ({ value, percentage: null })),
        };
      default:
        return reduceAttributes(
          collectionAttributesData?.collection?.attributes ??
            battleflyAttributes.data
        );
    }
  }, [
    battleflyAttributes.data,
    collectionAttributesData?.collection?.attributes,
    collectionName,
    treasureBoosts.data,
  ]);

  const { data: statData } = useQuery(
    ["stats", formattedAddress],
    () =>
      marketplace.getCollectionStats({
        id: formattedAddress,
      }),
    {
      enabled: !!formattedAddress,
    }
  );

  React.useEffect(() => {
    const scrollToTop = () => {
      document.getElementById("filter-heading")?.scrollIntoView();
    };
    Router.events.on("routeChangeComplete", scrollToTop);

    return () => Router.events.off("routeChangeComplete", scrollToTop);
  }, []);

  const isERC1155 =
    collectionData?.collection?.standard === TokenStandard.ERC1155;

  // First get all possible listed tokens
  const listedTokens = useQuery(
    ["listed-tokens", formattedAddress],
    () =>
      marketplace.getCollectionsListedTokens({ collection: formattedAddress }),
    {
      enabled: !!formattedAddress,
      select: React.useCallback(
        (
          data: Awaited<
            ReturnType<typeof marketplace.getCollectionsListedTokens>
          >
        ) => unique(data.listings.map(({ token }) => token.id)),
        []
      ),
    }
  );

  // Use listed tokenIds to retrieve any filters
  const attributeIds = React.useMemo(
    () =>
      formatSearchFilter(formattedSearch).map(
        (filter) =>
          `${formattedAddress}-${filter.toLowerCase().replace(",", "-")}`
      ),
    [formattedAddress, formattedSearch]
  );
  const filteredSmolTokens = useQuery(
    ["filtered-tokens", listedTokens.data, attributeIds],
    () =>
      client.getFilteredTokens({
        attributeIds,
        tokenIds: listedTokens.data ?? [],
      }),
    {
      enabled:
        Boolean(listedTokens.data) &&
        attributeIds.length > 0 &&
        !isBridgeworldItem &&
        !isSmolverseItem &&
        !isBattleflyItem,
      select: React.useCallback(
        ({
          metadataAttributes,
        }: Awaited<ReturnType<typeof client.getFilteredTokens>>) => {
          const sections = metadataAttributes.reduce<Record<string, string[]>>(
            (acc, { id }) => {
              const [, token, collection, key] = id.split("-");

              acc[key] ??= [];
              acc[key] = [...acc[key], `${collection}-${token}`];

              return acc;
            },
            {}
          );

          return Object.keys(sections).reduce((acc, key) => {
            const items = sections[key];

            return acc.length > 0
              ? acc.filter((item) => items.includes(item))
              : items;
          }, []);
        },
        []
      ),
    }
  );
  const filteredBridgeworldTokens = useQuery(
    ["bw-filtered-tokens", listedTokens.data, filters],
    () =>
      bridgeworld.getFilteredLegions({
        filters: {
          id_in: listedTokens.data?.map((id) => `${id}-metadata`),
          ...Object.entries(filters).reduce((acc, [key, [value]]) => {
            switch (key) {
              case "Summon Fatigue":
                acc[value === "Yes" ? "cooldown_not" : "cooldown"] = null;

                break;
              case "Times Summoned":
                acc["summons_in"] = value.split(",");

                break;
              case "Atlas Mine Boost":
                acc["boost_in"] = value
                  .split(",")
                  .map((choice) =>
                    (Number(choice.replace("%", "")) / 100).toString()
                  );

                break;
              case "Crafting Level":
              case "Questing Level":
                acc[`${key.toLowerCase().replace(" level", "")}_in`] = value
                  .split(",")
                  .map(Number);

                break;
              case "Crafting XP":
              case "Questing XP":
                acc[`${key.toLowerCase().replace(" xp", "Xp")}_gte`] = Number(
                  value.split(",")[0].replace(/[^\d]+/, "")
                );

                break;
              default:
                acc[`${key.toLowerCase()}_in`] = value.split(",");
            }

            return acc;
          }, {}),
        },
      }),
    {
      enabled:
        Boolean(listedTokens.data) &&
        Object.keys(filters).length > 0 &&
        isBridgeworldItem,
      select: React.useCallback(
        (data: Awaited<ReturnType<typeof bridgeworld.getFilteredLegions>>) =>
          data.legionInfos.map((item) => item.id.replace("-metadata", "")),
        []
      ),
    }
  );
  const filteredTreasureTokens = useQuery(
    ["treasure-filtered-tokens", listedTokens.data, filters],
    () =>
      bridgeworld.getFilteredTreasures({
        filters: {
          id_in: listedTokens.data?.map((id) => `${id}-metadata`),
          ...Object.entries(filters).reduce((acc, [key, [value]]) => {
            switch (key) {
              case "Atlas Mine Boost":
                acc["boost_in"] = value
                  .split(",")
                  .map((choice) =>
                    (Number(choice.replace("%", "")) / 100).toString()
                  );

                break;
              default:
                acc[`${key.toLowerCase()}_in`] = value
                  .split(",")
                  .map((item) => (key === "Tier" ? Number(item) : item));
            }

            return acc;
          }, {}),
        },
      }),
    {
      enabled:
        Boolean(listedTokens.data) &&
        Object.keys(filters).length > 0 &&
        isTreasure,
      select: React.useCallback(
        (data: Awaited<ReturnType<typeof bridgeworld.getFilteredTreasures>>) =>
          data.treasureInfos.map((item) => item.id.replace("-metadata", "")),
        []
      ),
    }
  );
  const filteredBattleflyTokens = useQuery(
    ["bf-filtered-tokens", listedTokens.data, filters],
    () =>
      fetch(
        `${
          process.env.NEXT_PUBLIC_BATTLEFLY_API
        }/battleflies/ids?${formattedSearch
          ?.split("&")
          .map((filters) =>
            filters.split("=").reduce(
              (field, values) =>
                field
                  ? `${field}=${values
                      .split("%2C")
                      .map((value, index) =>
                        index > 0 ? `${field}=${value}` : value
                      )
                      .join("&")}`
                  : values.slice(0, 1).toLowerCase().concat(values.slice(1)),
              ""
            )
          )
          .join("&")}`
      ).then((res) => res.json()),
    {
      enabled:
        Boolean(listedTokens.data) &&
        Object.keys(filters).length > 0 &&
        isBattleflyItem,
      refetchInterval: false,
      select: React.useCallback(
        (data: { items: number[] }) => {
          const hexxed = data.items.map((id) => `0x${id.toString(16)}`);

          return listedTokens.data?.filter((id) =>
            hexxed.some((hex) => id.endsWith(hex))
          );
        },
        [listedTokens.data]
      ),
    }
  );

  // Use filtered or listed tokenIds to perform text search
  const searchedTokens = useQuery(
    [
      "searched-token",
      filteredBattleflyTokens.data,
      filteredTreasureTokens.data,
      filteredBridgeworldTokens.data,
      filteredSmolTokens.data,
      listedTokens.data,
      searchParams,
    ],
    () =>
      marketplace.getTokensByName({
        name: searchParams,
        ids:
          filteredBattleflyTokens.data ??
          filteredTreasureTokens.data ??
          filteredBridgeworldTokens.data ??
          filteredSmolTokens.data ??
          listedTokens.data ??
          [],
      }),
    {
      enabled: Boolean(listedTokens.data) && Boolean(searchParams),
      refetchInterval: false,
      select: React.useCallback(
        (data: Awaited<ReturnType<typeof marketplace.getTokensByName>>) =>
          data.tokens.map((token) => token.id),
        []
      ),
    }
  );

  // Use final list of tokens to paginate listings
  const tokenIds = React.useMemo(
    () =>
      searchedTokens.data ??
      filteredBattleflyTokens.data ??
      filteredTreasureTokens.data ??
      filteredBridgeworldTokens.data ??
      filteredSmolTokens.data ??
      listedTokens.data,
    [
      searchedTokens.data,
      filteredBattleflyTokens.data,
      filteredTreasureTokens.data,
      filteredBridgeworldTokens.data,
      filteredSmolTokens.data,
      listedTokens.data,
    ]
  );
  const listings = useInfiniteQuery(
    ["listings", isERC1155, sortParam, tokenIds],
    ({ pageParam = 0 }) =>
      marketplace.getCollectionListings({
        erc1155Filters: {
          id_in: tokenIds,
        },
        erc721Filters: {
          status: Status.Active,
          token_in: tokenIds,
          quantity_gt: 0,
        },
        erc721Ordering: sortToField(sortParam),
        isERC1155,
        orderDirection: sortToDirection(sortParam),
        skip: pageParam,
      }),
    {
      enabled: !!tokenIds,
      getNextPageParam: (last, pages) =>
        last.listings?.length === MAX_ITEMS_PER_PAGE
          ? pages.length * MAX_ITEMS_PER_PAGE
          : undefined,
      keepPreviousData: true,
      refetchInterval: false,
    }
  );

  const legacyMetadata = useQuery(
    ["metadata", tokenIds],
    () => client.getCollectionMetadata({ ids: tokenIds ?? [] }),
    {
      enabled: !!tokenIds && !isBridgeworldItem && !isSmolverseItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const bridgeworldMetadata = useQuery(
    ["bw-metadata", tokenIds],
    () => bridgeworld.getBridgeworldMetadata({ ids: tokenIds ?? [] }),
    {
      enabled: !!tokenIds && isBridgeworldItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const smolverseMetadata = useQuery(
    ["sv-metadata", tokenIds],
    () => smolverse.getSmolverseMetadata({ ids: tokenIds ?? [] }),
    {
      enabled: !!tokenIds && isSmolverseItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const battleflyMetadata = useBattleflyMetadata(
    isBattleflyItem ? tokenIds ?? [] : []
  );
  const foundersMetadata = useFoundersMetadata(
    isFoundersItem ? tokenIds ?? [] : []
  );

  const isLoading = React.useMemo(
    () =>
      [
        listings.status,
        legacyMetadata.status,
        bridgeworldMetadata.status,
        smolverseMetadata.status,
        battleflyMetadata.status,
        foundersMetadata.status,
      ].every((status) => ["idle", "loading"].includes(status)),
    [
      listings.status,
      legacyMetadata.status,
      bridgeworldMetadata.status,
      smolverseMetadata.status,
      battleflyMetadata.status,
      foundersMetadata.status,
    ]
  );

  // reset searchParams on address change
  useEffect(() => {
    setSearchParams("");
    setSearchToken("");
  }, [formattedAddress]);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView) {
      listings.fetchNextPage();
    }
  }, [listings, inView]);

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
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 lg:hidden"
          onClose={setMobileFiltersOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="ml-auto relative max-w-xs w-full h-full bg-white dark:bg-gray-900 shadow-xl py-4 pb-12 flex flex-col overflow-y-auto">
              <div className="px-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                  Filters
                </h2>
                <button
                  type="button"
                  className="-mr-2 w-10 h-10 bg-white dark:bg-gray-900 p-2 rounded-md flex items-center justify-center text-gray-400"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 border-t border-gray-200 dark:border-gray-500">
                <h3 className="sr-only">Filter</h3>

                {attributeFilterList &&
                  Object.keys(attributeFilterList).map((attributeKey) => {
                    const attributes = attributeFilterList[attributeKey].sort(
                      (a, b) =>
                        parseFloat(a.percentage) - parseFloat(b.percentage)
                    );
                    return (
                      <Disclosure
                        as="div"
                        key={attributeKey}
                        className="border-t border-gray-200 dark:border-gray-500 px-4 py-6"
                        defaultOpen={
                          filters[attributeKey] &&
                          filters[attributeKey].length > 0
                        }
                      >
                        {({ open }) => (
                          <>
                            <h3 className="-mx-2 -my-3 flow-root">
                              <Disclosure.Button className="px-2 py-3 w-full flex items-center justify-between text-gray-400 hover:text-gray-500">
                                <span
                                  className={classNames(
                                    "font-medium",
                                    open
                                      ? "text-red-700 dark:text-gray-300"
                                      : "text-gray-900 dark:text-gray-400"
                                  )}
                                >
                                  {attributeKey}
                                </span>
                                <span className="ml-6 flex items-center">
                                  <span className="mr-2 text-gray-600">
                                    {attributes.length}
                                  </span>
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
                            <Disclosure.Panel className="pt-6">
                              <div className="space-y-6">
                                {attributes.map(
                                  ({ value, percentage }, optionIdx) => (
                                    <div
                                      key={value}
                                      className="flex justify-between text-sm"
                                    >
                                      <div className="flex items-center">
                                        <input
                                          id={`filter-mobile-${value}-${optionIdx}`}
                                          name={value}
                                          onChange={(e) => {
                                            router.replace({
                                              pathname: `/collection/${slugOrAddress}`,
                                              query: {
                                                search: e.target.checked
                                                  ? createFilter(
                                                      formattedSearch,
                                                      {
                                                        key: attributeKey,
                                                        value,
                                                      }
                                                    )
                                                  : removeFilter(
                                                      formattedSearch,
                                                      {
                                                        key: attributeKey,
                                                        value,
                                                      }
                                                    ),
                                              },
                                            });
                                          }}
                                          checked={
                                            filters[attributeKey]?.[0]
                                              .split(",")
                                              .includes(value) ?? false
                                          }
                                          type="checkbox"
                                          className="h-4 w-4 border-gray-300 rounded accent-red-500"
                                        />
                                        <label
                                          htmlFor={`filter-mobile-${value}-${optionIdx}`}
                                          className="ml-3 min-w-0 flex-1 text-gray-600 dark:text-gray-400"
                                        >
                                          {value}
                                        </label>
                                      </div>
                                      <p className="text-gray-400 dark:text-gray-500">
                                        {percentage !== null
                                          ? formatPercent(percentage)
                                          : ""}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    );
                  })}
                <div className="mt-4 mx-4">
                  <Button
                    onClick={() =>
                      router.replace({
                        pathname: `/collection/${slugOrAddress}`,
                        query: {
                          search: "",
                        },
                      })
                    }
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="py-24 flex flex-col items-center">
          {collectionData?.collection && statData?.collection ? (
            <>
              <h1 className="text-xl md:text-5xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                {statData.collection.name}
              </h1>
              {generateDescription(collectionName)}
              <div className="mt-12 overflow-hidden flex flex-col">
                <dl className="sm:-mx-8 -mt-8 flex divide-x-2">
                  <div className="flex flex-col px-6 sm:px-8 pt-8">
                    <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4 flex">
                      <span className="capsize">Floor Price</span>
                      <button
                        className="inline-flex self-end items-center ml-2"
                        onClick={() =>
                          setFloorCurrency((currency) =>
                            currency === "eth" ? "magic" : "eth"
                          )
                        }
                      >
                        <SwapIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                        {floorCurrency === "eth" ? (
                          <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                        ) : (
                          <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4" />
                        )}
                      </button>
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl flex">
                      {floorCurrency === "eth" ? (
                        <EthIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                      ) : (
                        <MagicIcon className="h-[0.6rem] w-[0.6rem] sm:h-4 sm:w-4 self-end mr-2" />
                      )}
                      <span className="capsize">
                        {floorCurrency === "eth"
                          ? formatNumber(
                              Number(
                                parseFloat(
                                  formatEther(statData.collection.floorPrice)
                                )
                              ) * parseFloat(ethPrice)
                            )
                          : formatPrice(statData.collection.floorPrice)}{" "}
                      </span>
                    </dd>
                  </div>
                  <div className="flex flex-col px-6 sm:px-8 pt-8">
                    <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                      Total Listings
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                      {formatNumber(statData.collection.totalListings)}
                    </dd>
                  </div>
                  <div className="flex flex-col px-6 sm:px-8 pt-8">
                    <dt className="order-2 text-[0.4rem] sm:text-base font-medium text-gray-500 dark:text-gray-400 mt-2 sm:mt-4">
                      Volume ($MAGIC)
                    </dt>
                    <dd className="order-1 text-base font-extrabold text-red-600 dark:text-gray-200 sm:text-3xl capsize">
                      {abbreviatePrice(statData.collection.totalVolume)}
                    </dd>
                  </div>
                </dl>
                {isERC1155 && statData.collection.totalListings > 0 && (
                  <button
                    className="ml-6 sm:ml-0 text-[0.4rem] sm:text-xs block underline place-self-start mt-2 dark:text-gray-300"
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
          <div className="block" id="filter-heading">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
            {attributeFilterList && (
              <div className="hidden lg:block sticky top-6">
                <h3 className="sr-only">Filter</h3>
                <div className="sticky top-16 overflow-auto h-[calc(100vh-72px)]">
                  {Object.keys(attributeFilterList).map((attributeKey) => {
                    const attributes = attributeFilterList[attributeKey].sort(
                      (a, b) =>
                        parseFloat(a.percentage) - parseFloat(b.percentage)
                    );

                    if (attributes.length === 0) {
                      return null;
                    }

                    return (
                      <Disclosure
                        as="div"
                        key={attributeKey}
                        className="border-b border-gray-200 dark:border-gray-500 py-6"
                        defaultOpen={
                          filters[attributeKey] &&
                          filters[attributeKey].length > 0
                        }
                      >
                        {({ open }) => (
                          <>
                            <h3 className="-my-3 flow-root">
                              <Disclosure.Button className="py-3 w-full flex items-center justify-between text-sm text-gray-400 hover:text-gray-500">
                                <span
                                  className={classNames(
                                    "font-medium",
                                    open
                                      ? "text-red-700 dark:text-gray-300"
                                      : "text-gray-900 dark:text-gray-400"
                                  )}
                                >
                                  {attributeKey}
                                </span>
                                <span className="ml-6 flex items-center">
                                  <span className="mr-2 text-gray-600">
                                    {attributes.length}
                                  </span>
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
                            <Disclosure.Panel className="pt-6 overflow-auto max-h-72">
                              <div className="space-y-4">
                                {attributes.map(
                                  ({ value, percentage }, optionIdx) => (
                                    <div
                                      key={value}
                                      className="flex justify-between text-sm"
                                    >
                                      <div className="flex items-center">
                                        <input
                                          id={`filter-${value}-${optionIdx}`}
                                          name={value}
                                          onChange={(e) => {
                                            router.replace({
                                              pathname: `/collection/${slugOrAddress}`,
                                              query: {
                                                search: e.target.checked
                                                  ? createFilter(
                                                      formattedSearch,
                                                      {
                                                        key: attributeKey,
                                                        value,
                                                      }
                                                    )
                                                  : removeFilter(
                                                      formattedSearch,
                                                      {
                                                        key: attributeKey,
                                                        value,
                                                      }
                                                    ),
                                              },
                                            });
                                          }}
                                          checked={
                                            filters[attributeKey]?.[0]
                                              .split(",")
                                              .includes(value.toString()) ??
                                            false
                                          }
                                          type="checkbox"
                                          className="h-4 w-4 border-gray-300 rounded accent-red-500"
                                        />
                                        <label
                                          htmlFor={`filter-${value}-${optionIdx}`}
                                          className="ml-3 text-gray-600 dark:text-gray-400"
                                        >
                                          {value}
                                        </label>
                                      </div>
                                      <p className="text-gray-400 dark:text-gray-500">
                                        {percentage !== null
                                          ? formatPercent(percentage)
                                          : ""}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    );
                  })}
                  <div className="mt-4 mx-1">
                    <Button
                      onClick={() =>
                        router.replace({
                          pathname: `/collection/${slugOrAddress}`,
                          query: {},
                        })
                      }
                    >
                      Clear all
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div
              className={classNames(
                attributeFilterList ? "lg:col-span-3" : "lg:col-span-4"
              )}
            >
              <section aria-labelledby="filter-heading" className="pt-6">
                <h2 id="filter-heading" className="sr-only">
                  Product filters
                </h2>

                {statData?.collection && (
                  <div className="flex items-center">
                    <div className="mr-2 w-full">
                      <input
                        type="text"
                        className="form-input focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 block w-full pr-16 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 dark:placeholder-gray-400 rounded-md disabled:placeholder-gray-300 disabled:text-gray-300 transition-placeholder transition-text ease-linear duration-300 disabled:cursor-not-allowed"
                        placeholder="Search Name... (Enter to search)"
                        value={searchToken}
                        onChange={(e) => setSearchToken(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setSearchParams(searchToken);
                          }
                        }}
                      />
                    </div>
                    <Menu
                      as="div"
                      className="relative z-20 inline-block text-left"
                    >
                      <div className="flex items-center space-x-2">
                        <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200">
                          Sort
                          <ChevronDownIcon
                            className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-100"
                            aria-hidden="true"
                          />
                        </Menu.Button>
                        {attributeFilterList && (
                          <button
                            type="button"
                            className="p-2 m-2 text-gray-400 hover:text-gray-500 lg:hidden"
                            onClick={() => setMobileFiltersOpen(true)}
                          >
                            <span className="sr-only">Filters</span>
                            <FilterIcon
                              className="w-5 h-5"
                              aria-hidden="true"
                            />
                          </button>
                        )}
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
                            {sortOptions
                              .slice(0, isERC1155 ? -1 : sortOptions.length)
                              .map((option) => {
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
                                          "text-red-500 dark:text-gray-100":
                                            active,
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
                    {attributeFilterList && (
                      <button
                        type="button"
                        className="hidden lg:p-2 lg:m-2 lg:text-gray-400 lg:hover:text-gray-500 lg:flex"
                        onClick={() => setToggleGrid(!toggleGrid)}
                      >
                        {toggleGrid ? (
                          <LargeGridIcon aria-hidden="true" />
                        ) : (
                          <ViewGridIcon
                            className="w-5 h-5"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </section>
              {isLoading ? (
                <CenterLoadingDots className="h-60" />
              ) : tokenIds?.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-36">
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                    No NFTs listed 😞
                  </h3>
                </div>
              ) : null}
              {collectionData && !isLoading ? (
                <section aria-labelledby="products-heading" className="my-8">
                  <h2 id="products-heading" className="sr-only">
                    {collectionData.collection?.name}
                  </h2>
                  <ul
                    role="list"
                    className={classNames(
                      `grid grid-cols-2 gap-y-10 sm:grid-cols-4 lg:grid-cols-${
                        toggleGrid ? 6 : 4
                      } gap-x-6 xl:gap-x-8`,
                      {
                        "lg:grid-cols-4": attributeFilterList,
                        "lg:grid-cols-6": !attributeFilterList,
                      }
                    )}
                  >
                    {listings.data?.pages.map((group, i) => (
                      <React.Fragment key={i}>
                        {/* ERC1155 */}
                        {group.tokens
                          ?.filter((token) => Boolean(token?.listings?.length))
                          .map((token) => {
                            const erc1155Metadata =
                              legacyMetadata.data?.tokens?.find(
                                (metadata) => metadata.tokenId === token.tokenId
                              );

                            const legionsMetadata =
                              bridgeworldMetadata.data?.tokens.find(
                                (item) => item.id === token.id
                              );

                            const svMetadata =
                              smolverseMetadata.data?.tokens.find(
                                (item) => item.id === token.id
                              );

                            const metadata =
                              isBridgeworldItem && legionsMetadata
                                ? {
                                    id: legionsMetadata.id,
                                    name: legionsMetadata.name,
                                    tokenId: token.tokenId,
                                    metadata: {
                                      image: legionsMetadata.image,
                                      name: legionsMetadata.name,
                                      description: "Consumables",
                                    },
                                  }
                                : isSmolverseItem && svMetadata
                                ? {
                                    id: svMetadata.id,
                                    name: svMetadata.name,
                                    tokenId: token.tokenId,
                                    metadata: {
                                      image: svMetadata.image ?? "",
                                      name: svMetadata.name,
                                      description: collectionName,
                                    },
                                  }
                                : erc1155Metadata;

                            return (
                              <li key={token.id} className="group">
                                <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                                  {metadata?.metadata ? (
                                    <ImageWrapper
                                      className="w-full h-full object-center object-fill group-hover:opacity-75"
                                      token={metadata}
                                    />
                                  ) : (
                                    <div className="animate-pulse w-full bg-gray-300 h-64 rounded-md m-auto" />
                                  )}
                                  <Link
                                    href={`/collection/${slugOrAddress}/${token.tokenId}`}
                                    passHref
                                  >
                                    <a className="absolute inset-0 focus:outline-none">
                                      <span className="sr-only">
                                        View details for {metadata?.name}
                                      </span>
                                    </a>
                                  </Link>
                                </div>
                                <div className="mt-4 text-base font-medium text-gray-900 space-y-2">
                                  <p className="text-xs text-gray-800 dark:text-gray-50 font-semibold truncate">
                                    {metadata?.name}
                                  </p>
                                  <p className="dark:text-gray-100 text-sm xl:text-base capsize">
                                    {formatNumber(
                                      parseFloat(
                                        formatEther(
                                          token?.listings?.[0]?.pricePerItem
                                        )
                                      )
                                    )}{" "}
                                    <span className="text-[0.5rem] xl:text-xs font-light">
                                      $MAGIC
                                    </span>
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
                        {group.listings?.map((listing) => {
                          const bfMetadata = battleflyMetadata.data?.find(
                            (item) => item.id === listing.token.id
                          );
                          const fsMetadata = foundersMetadata.data?.find(
                            (item) => item.id === listing.token.id
                          );
                          const legionsMetadata =
                            bridgeworldMetadata.data?.tokens.find(
                              (item) => item.id === listing.token.id
                            );
                          const erc721Metadata =
                            legacyMetadata.data?.tokens?.find(
                              (item) => item.tokenId === listing.token.tokenId
                            );

                          const role =
                            legionsMetadata?.metadata?.__typename ===
                            "LegionInfo"
                              ? legionsMetadata.metadata.role
                              : null;

                          const legionStats =
                            legionsMetadata?.metadata?.__typename ===
                            "LegionInfo"
                              ? {
                                  summons: legionsMetadata.metadata.summons,
                                  summonTotal: collectionName.includes(
                                    "Genesis"
                                  )
                                    ? "Unlimited"
                                    : "1",
                                  questingXp:
                                    legionsMetadata.metadata.questingXp,
                                  questing: legionsMetadata.metadata.questing,
                                  questingTotal:
                                    legionsMetadata.metadata.questing == 1
                                      ? 100
                                      : legionsMetadata.metadata.questing == 2
                                      ? 200
                                      : legionsMetadata.metadata.questing == 3
                                      ? 500
                                      : legionsMetadata.metadata.questing == 4
                                      ? 1000
                                      : legionsMetadata.metadata.questing == 5
                                      ? 2000
                                      : null,
                                  craftingTotal:
                                    legionsMetadata.metadata.crafting == 1
                                      ? 140
                                      : legionsMetadata.metadata.crafting == 2
                                      ? 160
                                      : legionsMetadata.metadata.crafting == 3
                                      ? 160
                                      : legionsMetadata.metadata.crafting == 4
                                      ? 160
                                      : legionsMetadata.metadata.crafting == 5
                                      ? 480
                                      : legionsMetadata.metadata.crafting == 6
                                      ? 480
                                      : null,
                                  craftingXp:
                                    legionsMetadata.metadata.craftingXp,
                                  crafting: legionsMetadata.metadata.crafting,
                                }
                              : null;

                          const metadata = isBridgeworldItem
                            ? legionsMetadata
                              ? {
                                  id: legionsMetadata.id,
                                  name: legionsMetadata.name,
                                  tokenId: listing.token.tokenId,
                                  metadata: {
                                    image: legionsMetadata.image,
                                    name: legionsMetadata.name,
                                    description: "Legions",
                                  },
                                }
                              : erc721Metadata
                            : bfMetadata
                            ? {
                                id: bfMetadata.id,
                                name: bfMetadata.name,
                                tokenId: listing.token.tokenId,
                                metadata: {
                                  image: bfMetadata.image ?? "",
                                  name: bfMetadata.name,
                                  description: collectionName,
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
                                  description: collectionName,
                                },
                              }
                            : getPetsMetadata({
                                ...listing.token,
                                collection: collectionData.collection!,
                              }) ?? erc721Metadata;

                          const normalizedLegion =
                            normalizeBridgeworldTokenMetadata(legionsMetadata);

                          return (
                            <li key={listing.id} className="group">
                              <div className="block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                                {metadata ? (
                                  <ImageWrapper
                                    className="w-full h-full object-center object-fill group-hover:opacity-75"
                                    token={metadata}
                                  />
                                ) : (
                                  <div className="animate-pulse w-full bg-gray-300 h-64 rounded-md m-auto" />
                                )}
                                <Link
                                  href={`/collection/${slugOrAddress}/${listing.token.tokenId}`}
                                >
                                  <a className="absolute inset-0 focus:outline-none">
                                    <span className="sr-only">
                                      View details for {metadata?.name}
                                    </span>
                                  </a>
                                </Link>
                              </div>
                              <div className="mt-4 font-medium text-gray-900 space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-300 truncate font-semibold">
                                    {metadata?.name}
                                    {role ? ` - ${role}` : ""}
                                  </p>
                                  {normalizedLegion ? (
                                    <div className="flex">
                                      <Popover.Root>
                                        <Popover.Trigger asChild>
                                          <button>
                                            <InformationCircleIcon className="h-4 w-4 fill-gray-500" />
                                          </button>
                                        </Popover.Trigger>
                                        <Popover.Anchor />
                                        <Popover.Content className="rounded-md w-60 border border-gray-100 dark:border-gray-600 bg-white dark:bg-gray-600 shadow-md text-gray-200 px-2 py-3">
                                          <div className="space-y-2 flex items-center justify-center flex-col">
                                            {(
                                              normalizedLegion.attributes ?? []
                                            ).map((attribute) => (
                                              <div
                                                key={attribute.attribute.name}
                                                className="flex items-center justify-between w-full"
                                              >
                                                <p className="text-xs text-gray-600 font-bold dark:text-gray-400 truncate">
                                                  {attribute.attribute.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300 truncate">
                                                  {attribute.attribute.value}
                                                </p>
                                              </div>
                                            ))}
                                          </div>
                                          <Popover.Arrow className="text-gray-100 dark:text-gray-600 fill-current" />
                                        </Popover.Content>
                                      </Popover.Root>
                                    </div>
                                  ) : null}
                                </div>
                                <p className="dark:text-gray-100 text-sm xl:text-base capsize">
                                  {formatNumber(
                                    parseFloat(
                                      formatEther(listing.pricePerItem)
                                    )
                                  )}{" "}
                                  <span className="text-[0.5rem] xl:text-xs font-light">
                                    $MAGIC
                                  </span>
                                </p>
                                {legionStats?.summons ? (
                                  <p className="xl:text-[0.6rem] text-[0.5rem] ml-auto whitespace-nowrap">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Summoned:
                                    </span>{" "}
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                      {legionStats.summons} /{" "}
                                      {legionStats.summonTotal}
                                    </span>
                                    <br />
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Questing:
                                    </span>{" "}
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                      Lv. {legionStats.questing} (
                                      {legionStats.questingXp}/
                                      {legionStats.questingTotal} XP)
                                    </span>
                                    <br />
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Crafting:
                                    </span>{" "}
                                    <span className="font-bold text-gray-700 dark:text-gray-300">
                                      Lv. {legionStats.crafting} (
                                      {legionStats.craftingXp}/
                                      {legionStats.craftingTotal} XP)
                                    </span>
                                  </p>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </ul>
                  {listings.hasNextPage && (
                    <ul
                      role="list"
                      ref={ref}
                      className="mt-10 grid grid-cols-2 gap-y-10 sm:grid-cols-4 gap-x-6 lg:grid-cols-6 xl:gap-x-8"
                    >
                      {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i}>
                          <div className="animate-pulse w-full bg-gray-300 h-64 rounded-md m-auto" />
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {isActivityLoading && <CenterLoadingDots className="h-60" />}
            {activityData?.listings && (
              <Listings
                listings={activityData.listings}
                title="Activity"
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
