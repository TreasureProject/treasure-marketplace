import type { Nft } from "../../types";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { Dialog, Transition, Listbox } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { SelectorIcon, CheckIcon } from "@heroicons/react/solid";
import classNames from "clsx";
import client from "../../lib/client";
import { useQuery } from "react-query";
import { addMonths, addWeeks, closestIndexTo } from "date-fns";
import { ethers } from "ethers";
import {
  useApproveContract,
  useContractApprovals,
  useCreateListing,
  useRemoveListing,
  useUpdateListing,
} from "../../lib/hooks";
import { useEthers } from "@yuyao17/corefork";
import { AddressZero } from "@ethersproject/constants";
import {
  formatNumber,
  generateIpfsLink,
  getCollectionSlugFromName,
} from "../../utils";
import { useRouter } from "next/router";
import Button from "../../components/Button";
import ImageWrapper from "../../components/ImageWrapper";
import Link from "next/link";
import { CenterLoadingDots } from "../../components/CenterLoadingDots";
import { formatEther } from "ethers/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { FEE, USER_SHARE } from "../../const";
import { TokenStandard } from "../../../generated/graphql";

type DrawerProps = {
  actions: Array<"create" | "remove" | "update">;
  needsContractApproval: boolean;
  nft: Nft;
  onClose: () => void;
};

const dates = [
  { id: 1, label: "1 Week", value: addWeeks(new Date(), 1) },
  { id: 2, label: "2 Weeks", value: addWeeks(new Date(), 2) },
  { id: 3, label: "1 Month", value: addMonths(new Date(), 1) },
  { id: 4, label: "3 Months", value: addMonths(new Date(), 3) },
];

const tabs = [
  { name: "Collected", href: "/inventory" },
  { name: "Listed", href: "/inventory/listed" },
  { name: "Staked", href: "/inventory/staked" },
  { name: "Sold", href: "/inventory/sold" },
];

const startCase = (text: string) =>
  text.slice(0, 1).toUpperCase().concat(text.slice(1));

const Drawer = ({
  actions,
  needsContractApproval,
  nft,
  onClose,
}: DrawerProps) => {
  const [price, setPrice] = useState(
    nft.listing
      ? ethers.utils.formatEther(nft.listing.pricePerItem).replace(".0", "")
      : ""
  );
  const [quantity, setQuantity] = useState(nft.listing?.quantity ?? "1");
  const [selectedDate, setSelectedDate] = useState(() =>
    nft.listing
      ? dates[
          closestIndexTo(
            new Date(Number(nft.listing.expires)),
            dates.map(({ value }) => value)
          ) ?? 3
        ]
      : dates[3]
  );
  const [show, toggle] = useReducer((value) => !value, true);

  const approveContract = useApproveContract(nft.address, nft.standard);
  const createListing = useCreateListing();
  const removeListing = useRemoveListing();
  const updateListing = useUpdateListing();

  const isFormDisabled =
    needsContractApproval ||
    [
      createListing.state.status,
      removeListing.state.status,
      updateListing.state.status,
    ].includes("Mining");

  useEffect(() => {
    if (
      [
        createListing.state.status,
        removeListing.state.status,
        updateListing.state.status,
      ].includes("Success")
    ) {
      toggle();
    }
  }, [
    createListing.state.status,
    removeListing.state.status,
    updateListing.state.status,
  ]);

  return (
    <Transition.Root appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden z-50"
        onClose={toggle}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-gray-300 dark:bg-gray-600 opacity-60" />

          <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
              afterLeave={onClose}
            >
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col py-6 bg-white dark:bg-gray-900 shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-200">
                        {actions.length > 1 ? "Manage" : startCase(actions[0])}{" "}
                        {nft.name} Listing
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white dark:bg-transparent rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={toggle}
                        >
                          <span className="sr-only">Close panel</span>
                          <XIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 relative flex-1 px-4 sm:px-6 pb-24">
                    <div className="space-y-6">
                      <div>
                        <div className="block w-full aspect-w-1 aspect-h-1 sm:aspect-w-5 sm:aspect-h-5 rounded-lg overflow-hidden">
                          <ImageWrapper
                            className="object-fill object-center"
                            src={nft.source}
                            token={nft}
                          />
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-200">
                              <span className="sr-only">Details for </span>
                              {nft.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500 uppercase">
                              {nft.collection}
                            </p>
                          </div>
                        </div>
                      </div>

                      {needsContractApproval ? (
                        <Button
                          isLoading={approveContract.state.status === "Mining"}
                          loadingText="Approving..."
                          onClick={() => approveContract.send()}
                          variant="secondary"
                        >
                          Approve Collection to List
                        </Button>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor="price"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                              >
                                Price
                                {nft.standard === TokenStandard.Erc1155
                                  ? " Per Item"
                                  : ""}
                              </label>
                              <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                  type="number"
                                  name="price"
                                  id="price"
                                  className="form-input focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 block w-full pr-16 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 dark:placeholder-gray-400 rounded-md disabled:placeholder-gray-300 disabled:text-gray-300 transition-placeholder transition-text ease-linear duration-300 disabled:cursor-not-allowed"
                                  placeholder="0.00"
                                  maxLength={10}
                                  min="0"
                                  aria-describedby="price-currency"
                                  onChange={(event) => {
                                    const { value, maxLength } = event.target;
                                    const price = value.slice(0, maxLength);
                                    setPrice(
                                      String(Math.abs(parseFloat(price)))
                                    );
                                  }}
                                  value={price}
                                  disabled={isFormDisabled}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                  <span
                                    className="text-gray-500 dark:text-gray-400 sm:text-sm"
                                    id="price-currency"
                                  >
                                    $MAGIC
                                  </span>
                                </div>
                              </div>
                              <div
                                className={classNames(
                                  "space-y-1 mt-2 text-[0.5rem]",
                                  {
                                    "opacity-75": isFormDisabled,
                                  }
                                )}
                              >
                                <div className="flex justify-between px-2">
                                  <p className="text-gray-400">
                                    Royalties ({FEE * 100 + "%"})
                                  </p>
                                  <p>
                                    ≈{" "}
                                    {formatNumber(
                                      parseFloat(price || "0") * FEE
                                    )}{" "}
                                    $MAGIC
                                  </p>
                                </div>
                                <div className="flex justify-between px-2">
                                  <p className="text-gray-400">
                                    Your share ({USER_SHARE * 100 + "%"})
                                  </p>
                                  <p>
                                    ≈{" "}
                                    {formatNumber(
                                      parseFloat(price || "0") * USER_SHARE
                                    )}{" "}
                                    $MAGIC
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <Listbox
                                value={selectedDate}
                                onChange={setSelectedDate}
                                disabled={isFormDisabled}
                              >
                                <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Expire Date
                                </Listbox.Label>
                                <div className="mt-1 relative">
                                  <Listbox.Button className="bg-white relative w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 sm:text-sm disabled:text-gray-300 disabled:cursor-not-allowed transition-text ease-linear duration-300">
                                    <span className="block truncate">
                                      {selectedDate.label}
                                    </span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                      <SelectorIcon
                                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                      />
                                    </span>
                                  </Listbox.Button>

                                  <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                  >
                                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                      {dates.map((date) => (
                                        <Listbox.Option
                                          key={date.id}
                                          className={({ active }) =>
                                            classNames(
                                              active
                                                ? "text-white bg-red-600 dark:bg-gray-800"
                                                : "text-gray-900 dark:text-gray-200",
                                              "cursor-default select-none relative py-2 pl-3 pr-9"
                                            )
                                          }
                                          value={date}
                                        >
                                          {({ selected, active }) => (
                                            <>
                                              <span
                                                className={classNames(
                                                  selected
                                                    ? "font-semibold"
                                                    : "font-normal",
                                                  "block truncate"
                                                )}
                                              >
                                                {date.label}
                                              </span>

                                              {selected ? (
                                                <span
                                                  className={classNames(
                                                    active
                                                      ? "text-white"
                                                      : "text-red-600 dark:text-gray-200",
                                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                                  )}
                                                >
                                                  <CheckIcon
                                                    className="h-5 w-5"
                                                    aria-hidden="true"
                                                  />
                                                </span>
                                              ) : null}
                                            </>
                                          )}
                                        </Listbox.Option>
                                      ))}
                                    </Listbox.Options>
                                  </Transition>
                                </div>
                              </Listbox>
                            </div>
                            {nft.standard === TokenStandard.Erc1155 && (
                              <div>
                                <Listbox
                                  value={quantity}
                                  onChange={setQuantity}
                                  disabled={isFormDisabled}
                                >
                                  <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Quantity
                                  </Listbox.Label>
                                  <div className="mt-1 relative">
                                    <Listbox.Button className="bg-white relative w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:disabled:bg-gray-500 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 dark:focus:ring-gray-300 dark:focus:border-gray-300 sm:text-sm disabled:text-gray-300 disabled:cursor-not-allowed transition-text ease-linear duration-300">
                                      <span className="block truncate">
                                        {quantity}
                                      </span>
                                      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                        <SelectorIcon
                                          className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                          aria-hidden="true"
                                        />
                                      </span>
                                    </Listbox.Button>

                                    <Transition
                                      as={Fragment}
                                      leave="transition ease-in duration-100"
                                      leaveFrom="opacity-100"
                                      leaveTo="opacity-0"
                                    >
                                      <Listbox.Options className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                        {Array.from({
                                          length: Number(nft.total) || 0,
                                        }).map((_, idx) => (
                                          <Listbox.Option
                                            key={idx}
                                            className={({ active }) =>
                                              classNames(
                                                active
                                                  ? "text-white bg-red-600 dark:bg-gray-800"
                                                  : "text-gray-900 dark:text-gray-200",
                                                "cursor-default select-none relative py-2 pl-3 pr-9"
                                              )
                                            }
                                            value={idx + 1}
                                          >
                                            {({ selected, active }) => (
                                              <>
                                                <span
                                                  className={classNames(
                                                    selected
                                                      ? "font-semibold"
                                                      : "font-normal",
                                                    "block truncate"
                                                  )}
                                                >
                                                  {idx + 1}
                                                </span>

                                                {selected ? (
                                                  <span
                                                    className={classNames(
                                                      active
                                                        ? "text-white"
                                                        : "text-red-600 dark:text-gray-200",
                                                      "absolute inset-y-0 right-0 flex items-center pr-4"
                                                    )}
                                                  >
                                                    <CheckIcon
                                                      className="h-5 w-5"
                                                      aria-hidden="true"
                                                    />
                                                  </span>
                                                ) : null}
                                              </>
                                            )}
                                          </Listbox.Option>
                                        ))}
                                      </Listbox.Options>
                                    </Transition>
                                  </div>
                                </Listbox>
                              </div>
                            )}
                          </div>

                          <div>
                            {actions.map((action) => {
                              switch (action) {
                                case "create":
                                  return (
                                    <Button
                                      disabled={
                                        price.trim() === "" || isFormDisabled
                                      }
                                      isLoading={
                                        createListing.state.status === "Mining"
                                      }
                                      loadingText="Listing..."
                                      onClick={() =>
                                        createListing.send(
                                          nft,
                                          nft.address,
                                          Number(nft.tokenId),
                                          Number(quantity),
                                          ethers.utils.parseEther(price),
                                          selectedDate.value.getTime()
                                        )
                                      }
                                    >
                                      Create {nft.name} Listing
                                    </Button>
                                  );
                                case "remove":
                                  return (
                                    <>
                                      <div className="relative my-4">
                                        <div className="absolute inset-0 flex items-center">
                                          <div className="w-full border-t border-gray-300 dark:border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                          <span className="px-2 bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-300">
                                            OR
                                          </span>
                                        </div>
                                      </div>
                                      <Button
                                        disabled={isFormDisabled}
                                        isLoading={
                                          removeListing.state.status ===
                                          "Mining"
                                        }
                                        loadingText="Removing..."
                                        onClick={() =>
                                          removeListing.send(
                                            nft.name,
                                            nft.address,
                                            Number(nft.tokenId)
                                          )
                                        }
                                        variant="secondary"
                                      >
                                        Remove {nft.name} Listing
                                      </Button>
                                    </>
                                  );
                                case "update":
                                  return (
                                    <Button
                                      disabled={isFormDisabled}
                                      isLoading={
                                        updateListing.state.status === "Mining"
                                      }
                                      loadingText="Updating..."
                                      onClick={() =>
                                        updateListing.send(
                                          nft,
                                          nft.address,
                                          Number(nft.tokenId),
                                          Number(quantity),
                                          ethers.utils.parseEther(price),
                                          selectedDate.value.getTime()
                                        )
                                      }
                                    >
                                      Update {nft.name} Listing
                                    </Button>
                                  );
                                default:
                                  return null;
                              }
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

const Inventory = () => {
  const router = useRouter();
  const [nft, setNft] = useState<Nft | null>(null);
  const { account } = useEthers();
  const [section] = router.query.section ?? [""];

  const inventory = useQuery(
    "inventory",
    () =>
      client.getUserInventory({ id: account?.toLowerCase() ?? AddressZero }),
    { enabled: !!account }
  );

  const [data, totals, updates, emptyMessage] = useMemo(() => {
    const empty: Record<string, NonNullable<Nft["listing"]>> = {};
    const {
      hidden = [],
      listings = [],
      sold = [],
      tokens = [],
    } = inventory.data?.user ?? {};
    const totals = [...listings, ...tokens].reduce<Record<string, number>>(
      (acc, value) => {
        const { collection, tokenId } = value.token;
        const key = `${collection.address}-${tokenId}`;

        acc[key] ??= 0;
        acc[key] += Number(value.quantity);

        return acc;
      },
      {}
    );
    const updates = tokens.reduce<Record<string, NonNullable<Nft["listing"]>>>(
      (acc, value) => {
        const { collection, tokenId } = value.token;
        const key = `${collection.address}-${tokenId}`;
        const listing = listings.find(
          ({ token }) =>
            token.collection.address === collection.address &&
            token.tokenId === tokenId
        );

        if (listing) {
          const { expires, pricePerItem, quantity } = listing;

          acc[key] = { expires, pricePerItem, quantity };
        }

        return acc;
      },
      {}
    );

    switch (section) {
      case "staked":
        return [hidden, totals, updates, "No staked listings 🙂"] as const;
      case "listed":
        return [listings, totals, empty, "No NFTs listed 🙂"] as const;
      case "sold":
        return [sold, totals, empty, null] as const;
      default:
        return [tokens, totals, updates, null] as const;
    }
  }, [inventory.data?.user, section]);

  const collections = data.map(({ token: { collection } }) => collection);
  const approvals = useContractApprovals(
    [...new Set(collections.map(({ address }) => address))]
      .map((address) => collections.find((item) => address === item.address))
      .filter(Boolean)
  );

  const onClose = useCallback(() => setNft(null), []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-24">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex-1 text-2xl font-bold text-gray-900 dark:text-gray-200">
              Inventory
            </h1>

            <div className="mt-3 sm:mt-2">
              <div className="block">
                <div className="flex items-center border-b border-gray-200 dark:border-gray-500">
                  <nav
                    className="flex-1 -mb-px flex space-x-6 xl:space-x-8"
                    aria-label="Tabs"
                  >
                    {tabs.map((tab) => {
                      const isCurrentTab =
                        section === tab.href.replace(/\/inventory\/?/, "");

                      return (
                        <Link key={tab.name} href={tab.href} passHref>
                          <a
                            aria-current={isCurrentTab ? "page" : undefined}
                            className={classNames(
                              isCurrentTab
                                ? "border-red-500 text-red-600 dark:border-gray-300 dark:text-gray-300"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:border-gray-500",
                              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
                            )}
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
            <section className="mt-8 pb-16">
              {inventory.isLoading && <CenterLoadingDots className="h-36" />}
              {data.length === 0 && !inventory.isLoading && (
                <div className="flex flex-col justify-center items-center h-36">
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-200">
                    {emptyMessage ??
                      `No NFTs ${
                        section.length === 0 ? "collected" : section
                      } 😞`}
                  </h3>
                </div>
              )}
              {data.length > 0 && (
                <ul
                  role="list"
                  className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8"
                >
                  {data.map(
                    ({ id, expires, pricePerItem, quantity, token }) => {
                      const slugOrAddress =
                        getCollectionSlugFromName(token.collection.name) ??
                        token.collection.id;

                      return (
                        <li key={id}>
                          <div className="group block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                            <ImageWrapper
                              className={classNames(
                                "object-fill object-center pointer-events-none",
                                {
                                  "group-hover:opacity-80": section !== "sold",
                                }
                              )}
                              token={token}
                            />
                            {section !== "sold" ? (
                              <button
                                type="button"
                                className="absolute inset-0 focus:outline-none"
                                onClick={() =>
                                  setNft({
                                    address: token.collection.address,
                                    collection: token.collection.name,
                                    name: token.name ?? "",
                                    listing: pricePerItem
                                      ? { expires, pricePerItem, quantity }
                                      : updates[
                                          `${token.collection.address}-${token.tokenId}`
                                        ],
                                    source: token.metadata?.image.includes(
                                      "ipfs"
                                    )
                                      ? generateIpfsLink(token.metadata.image)
                                      : token.metadata?.image ?? "",
                                    standard: token.collection.standard,
                                    tokenId: token.tokenId,
                                    total:
                                      totals[
                                        `${token.collection.address}-${token.tokenId}`
                                      ],
                                  })
                                }
                              >
                                <span className="sr-only">
                                  View details for {token.name}
                                </span>
                              </button>
                            ) : null}
                          </div>
                          <div className="mt-4 flex items-center justify-between text-base font-medium text-gray-900">
                            <Link
                              href={`/collection/${slugOrAddress}`}
                              passHref
                            >
                              <a className="text-gray-500 dark:text-gray-400 font-thin tracking-wide uppercase text-[0.5rem] hover:underline">
                                {token.metadata?.description}
                              </a>
                            </Link>
                            {pricePerItem && (
                              <p className="dark:text-gray-100">
                                {formatNumber(
                                  parseFloat(formatEther(pricePerItem))
                                )}{" "}
                                <span className="text-xs font-light">
                                  $MAGIC
                                </span>
                              </p>
                            )}
                            {!expires &&
                              !pricePerItem &&
                              quantity &&
                              token.collection.standard ===
                                TokenStandard.Erc1155 && (
                                <span className="text-gray-600 text-xs text-[0.6rem]">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Quantity:
                                  </span>{" "}
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {quantity}
                                  </span>
                                </span>
                              )}
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <Link
                              href={`/collection/${slugOrAddress}/${token.tokenId}`}
                              passHref
                            >
                              <a className="text-xs text-gray-800 dark:text-gray-50 font-semibold truncate hover:underline">
                                {token.name}
                              </a>
                            </Link>
                            {expires && (
                              <p className="text-xs text-[0.6rem] ml-auto whitespace-nowrap">
                                <span className="text-gray-500 dark:text-gray-400">
                                  Expires in:
                                </span>{" "}
                                <span className="font-bold text-gray-700 dark:text-gray-300">
                                  {formatDistanceToNow(
                                    new Date(Number(expires))
                                  )}
                                </span>
                              </p>
                            )}
                            {!expires &&
                              pricePerItem &&
                              quantity &&
                              token.collection.standard ===
                                TokenStandard.Erc1155 && (
                                <span className="text-gray-600 text-xs text-[0.6rem]">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Quantity:
                                  </span>{" "}
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {quantity}
                                  </span>
                                </span>
                              )}
                          </div>
                          {expires &&
                            quantity &&
                            token.collection.standard ===
                              TokenStandard.Erc1155 && (
                              <div className="flex mt-1 justify-end">
                                <span className="text-gray-600 text-xs text-[0.6rem]">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    Quantity:
                                  </span>{" "}
                                  <span className="font-bold text-gray-700 dark:text-gray-300">
                                    {quantity}
                                  </span>
                                </span>
                              </div>
                            )}
                        </li>
                      );
                    }
                  )}
                </ul>
              )}
            </section>
          </div>
        </main>

        {nft ? (
          <Drawer
            actions={
              router.query.section?.[0]
                ? ["update", "remove"]
                : nft.listing
                ? ["update"]
                : ["create"]
            }
            needsContractApproval={!Boolean(approvals[nft.address])}
            nft={nft}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
};

export default Inventory;
