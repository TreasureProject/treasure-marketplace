import { Dialog, Disclosure, Transition } from "@headlessui/react";
import {
  FilterIcon,
  MinusSmIcon,
  PlusSmIcon,
  XIcon,
} from "@heroicons/react/solid";
import { GetCollectionAttributesQuery } from "../../generated/queries.graphql";
import { GetUserInventoryQuery } from "../../generated/marketplace.graphql";
import { bridgeworld, client, metadata } from "../lib/client";
import { formatPercent } from "../utils";
import { useRouter } from "next/router";
import { useCollection, useEthers } from "../lib/hooks";
import { useQuery, useQueryClient } from "react-query";
import Button from "./Button";
import React from "react";
import classNames from "clsx";
import useLocalStorage from "use-local-storage-state";
import { METADATA_COLLECTIONS } from "../const";

type Attribute = {
  name: string;
  value: string;
  percentage: null;
};

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

// For Realm
const FEATURES = [
  "Basin",
  "Bay",
  "Biosphere",
  "Butte",
  "Canal",
  "Canyon",
  "Cape",
  "Cave",
  "Cove",
  "Desert",
  "Dune",
  "Fjord",
  "Geyser",
  "Glacier",
  "Gulf",
  "Ice shelf",
  "Island",
  "Lagoon",
  "Lake",
  "Mesa",
  "Mountain",
  "Oasis",
  "Ocean",
  "Peninsula",
  "Plateau",
  "Pond",
  "Prairie",
  "Reef",
  "River",
  "Sea",
  "Swamp",
  "Tundra",
  "Valley",
  "Volcano",
  "Waterfall",
];
const STRUCTURES = ["1", "2", "3", "5", "8", "13"];

const combine = (base?: string) =>
  Array.from(new URLSearchParams(base).entries()).reduce<
    Record<string, string[]>
  >((acc, [key, value]) => {
    acc[key] ??= [];
    acc[key] = [...acc[key], ...value.split(",")];

    return acc;
  }, {});

const createFilter = (
  base: string | undefined,
  search: {
    key: string;
    value: string;
  }
) => {
  const combined = combine(base);
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
  const combined = combine(base);

  const values = combined[search.key] ?? [];
  const filteredValues = values?.filter((v) => v !== search.value);
  if (!filteredValues || filteredValues.length === 0) {
    delete combined[search.key];
  } else {
    combined[search.key] = filteredValues;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new URLSearchParams(combined).toString();
};

const unique = <T,>(array: T[]) => Array.from(new Set(array));

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
        // TODO: Review, but works for now
        switch (true) {
          case [
            "Agility",
            "Endurance",
            "Intelligence",
            "Strength",
            "Vitality",
            "Will",
          ].includes(attribute.name):
            acc[attribute.name] = [10, 20, 30, 40, 50, 60, 70, 80, 90].map(
              (value) => ({ percentage: "", value: `>= ${value}` })
            );

            break;
          default:
            acc[attribute.name] = [
              ...(acc[attribute.name] ?? []),
              {
                value: attribute.value,
                percentage: attribute.percentage
                  ? `${attribute.percentage}`
                  : "",
              },
            ];

            break;
        }

        return acc;
      }, {})
    : null;
};

export function useFilters() {
  const {
    query: { search },
  } = useRouter();

  return combine(Array.isArray(search) ? search[0] : search);
}

export function useFiltersList() {
  const router = useRouter();
  const { address: slugOrAddress } = router.query;
  const { id: formattedAddress, name: collectionName } =
    useCollection(slugOrAddress);

  const isTreasure = collectionName === "Treasures";
  const isBattleflyItem = collectionName === "BattleFly";
  const isShared = METADATA_COLLECTIONS.includes(collectionName);
  const isInventory = router.pathname.startsWith("/inventory/");

  const legacyAttributes = useQuery(
    ["legacy-attributes", formattedAddress],
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
      select: (
        data: Array<{ name: string; values: Array<{ value: string }> }>
      ) =>
        data.reduce<Array<Attribute>>((acc, { name, values }) => {
          values.forEach(({ value }) => {
            acc.push({ name, value, percentage: null });
          });

          return acc.sort((left, right) => left.name.localeCompare(right.name));
        }, []),
    }
  );
  const sharedAttributes = useQuery(
    ["shared-attributes", formattedAddress],
    () => metadata.getCollectionAttributes(),
    {
      enabled: isShared,
      refetchInterval: false,
      select: (data) => {
        return {
          attributes: data.attributes.filter((attribute) =>
            attribute.id.startsWith(formattedAddress)
          ),
        };
      },
    }
  );

  const queryClient = useQueryClient();
  const inventory =
    queryClient.getQueryData<GetUserInventoryQuery>("inventory");

  return React.useMemo(() => {
    if (isInventory) {
      return {
        Collections: unique(
          inventory?.user?.tokens.map(({ token }) => token.collection.name) ??
            []
        )
          .sort()
          .map((value) => ({ value, percentage: null })),
      };
    }

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
        };
      case collectionName === "Realm": {
        const options = STRUCTURES.map((value) => ({
          value: `>= ${value}`,
          percentage: null,
        }));

        return {
          Aquariums: options,
          Cities: options,
          Farms: options,
          Features: FEATURES.map((value) => ({ value, percentage: null })),
          "Research Labs": options,
        };
      }
      case isBattleflyItem:
        return reduceAttributes(battleflyAttributes.data);
      case isShared:
        return reduceAttributes(sharedAttributes.data?.attributes);
      default:
        return reduceAttributes(legacyAttributes.data?.collection?.attributes);
    }
  }, [
    battleflyAttributes.data,
    collectionName,
    inventory?.user?.tokens,
    isBattleflyItem,
    isInventory,
    isShared,
    legacyAttributes.data?.collection?.attributes,
    sharedAttributes.data?.attributes,
    treasureBoosts.data,
  ]);
}

export function Filters() {
  const router = useRouter();
  const { search } = router.query;
  const formattedSearch = Array.isArray(search) ? search[0] : search;
  const filters = combine(formattedSearch);
  const attributeFilterList = useFiltersList();

  if (!attributeFilterList) {
    return null;
  }

  return (
    <>
      <h3 className="sr-only">Filters</h3>
      <div className="lg:sticky lg:top-16 lg:overflow-auto lg:h-[calc(100vh-72px)]">
        {Object.keys(attributeFilterList).map(
          (attributeKey: keyof typeof attributeFilterList) => {
            const attributes = attributeFilterList[attributeKey]?.sort(
              (left: { value: string }, right: { value: string }) => {
                const leftNumber = Number(left.value.replace(/[^\d]+/g, ""));
                const rightNumber = Number(right.value.replace(/[^\d]+/g, ""));

                if (isNaN(leftNumber) || isNaN(rightNumber)) {
                  return left.value.localeCompare(right.value);
                }

                return leftNumber - rightNumber;
              }
            );

            if ((attributes?.length ?? 0) === 0) {
              return null;
            }

            return (
              <Disclosure
                as="div"
                key={attributeKey}
                className="border-t lg:border-t-0 lg:border-b border-gray-200 dark:border-gray-500 py-6 px-4 lg:px-0"
                defaultOpen={
                  filters[attributeKey] && filters[attributeKey].length > 0
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
                            {attributes?.length ?? 0}
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
                    <Disclosure.Panel className="pt-6 lg:overflow-auto lg:max-h-72">
                      <div className="space-y-4">
                        {attributes?.map(
                          ({ value, percentage }, optionIdx: number) => (
                            <div
                              key={value}
                              className="flex justify-between text-sm"
                            >
                              <div className="flex items-center">
                                <input
                                  id={`filter-${value}-${optionIdx}`}
                                  name={value}
                                  onChange={(e) => {
                                    const search = e.target.checked
                                      ? createFilter(formattedSearch, {
                                          key: attributeKey,
                                          value,
                                        })
                                      : removeFilter(formattedSearch, {
                                          key: attributeKey,
                                          value,
                                        });
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const { search: _search, ...query } =
                                      router.query;

                                    router.replace({
                                      pathname: router.pathname,
                                      query:
                                        Object.keys(search).length > 0
                                          ? { ...query, search }
                                          : query,
                                    });
                                  }}
                                  checked={
                                    filters[attributeKey]?.includes(
                                      value.toString()
                                    ) ?? false
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
                                {percentage ? formatPercent(percentage) : ""}
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
          }
        )}
        <div className="mt-4 mx-4 lg:mx-1">
          <Button
            onClick={() => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { search: _search, ...query } = router.query;

              router.replace({
                pathname: router.pathname,
                query,
              });
            }}
          >
            Clear all
          </Button>
        </div>
      </div>
    </>
  );
}

function useMobileFiltersState() {
  const { account } = useEthers();

  return useLocalStorage(`mp:mobile-filters:${account}`, {
    defaultValue: false,
  });
}

export function MobileFilterButton() {
  const attributeFilterList = useFiltersList();
  const [, setOpen] = useMobileFiltersState();

  if (!attributeFilterList) {
    return null;
  }

  return (
    <button
      type="button"
      className="p-2 m-2 text-gray-400 hover:text-gray-500 lg:hidden"
      onClick={() => setOpen(true)}
    >
      <span className="sr-only">Filters</span>
      <FilterIcon className="w-5 h-5" aria-hidden="true" />
    </button>
  );
}

export function MobileFiltersWrapper() {
  const [open, setOpen] = useMobileFiltersState();

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 flex z-40 lg:hidden"
        onClose={setOpen}
      >
        <Transition.Child
          as={React.Fragment}
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
          as={React.Fragment}
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
                onClick={() => setOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 border-t border-gray-200 dark:border-gray-500">
              <Filters />
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
