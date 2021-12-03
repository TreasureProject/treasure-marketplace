import * as abis from "../lib/abis";
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
import client from "../lib/client";
import { useQuery } from "react-query";
import { addMonths, addWeeks, closestIndexTo } from "date-fns";
import { ethers } from "ethers";
import {
  useApproveContract,
  useContractApprovals,
  useCreateListing,
  useRemoveListing,
  useUpdateListing,
} from "../lib/hooks";
import { ChainId, ERC20MockInterface } from "@yuyao17/corefork";
import { Contract } from "ethers";
import { Contracts } from "../const";
import { Interface } from "@ethersproject/abi";
import { toast } from "react-hot-toast";
// import { useEffect, useMemo, useState } from "react";
import {
  useContractCalls,
  useContractFunction,
  useEthers,
} from "@yuyao17/corefork";
import { useQueryClient } from "react-query";
import plur from "plur";
import { generateIpfsLink } from "../utils";
import { useRouter } from "next/router";
import Button from "../components/Button";
import Image from "next/image";

type Nft = {
  address: string;
  collection: string;
  // listing?: {
  //   expires: string;
  //   pricePerItem: string;
  //   quantity: number;
  // };
  name: string;
  total: number;
  source: string;
  tokenId: string;
};

type DrawerProps = {
  // canCancelListing: boolean;
  // needsContractApproval: boolean;
  nft: Nft;
  onClose: () => void;
};

const erc20 = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "_to", type: "address" },
      { internalType: "uint256", name: "_amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "sender", type: "address" },
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// const dates = [
//   { id: 1, label: "1 Week", value: addWeeks(new Date(), 1) },
//   { id: 2, label: "2 Weeks", value: addWeeks(new Date(), 2) },
//   { id: 3, label: "1 Month", value: addMonths(new Date(), 1) },
//   { id: 4, label: "3 Months", value: addMonths(new Date(), 3) },
// ];

// const tabs = [
//   { name: "Collected", href: "/inventory" },
//   { name: "Listed", href: "/inventory/listed" },
//   { name: "Sold", href: "/inventory/sold" },
// ];

function useMintToken(address: string) {
  const [{ name, quantity }, setInfo] = useState({ name: "", quantity: 0 });
  const queryClient = useQueryClient();
  const { account } = useEthers();

  const mint = useContractFunction(
    new Contract(address, abis.erc1155),
    "mint(address,uint256,uint256)"
  );

  useEffect(() => {
    switch (mint.state.status) {
      case "Exception":
      case "Fail":
        toast.error(`Transaction failed! ${mint.state.errorMessage}`);

        return;
      case "Success":
        toast.success(
          `Successfully minted ${quantity} ${plur(name, quantity)}!`
        );

        queryClient.invalidateQueries("inventory", { refetchInactive: true });

        break;
    }
  }, [name, quantity, queryClient, mint.state.errorMessage, mint.state.status]);

  return useMemo(() => {
    const send = (name: string, tokenId: number, quantity: number) => {
      setInfo({ name, quantity });
      mint.send(account, tokenId, quantity);
    };

    return { ...mint, send };
  }, [account, mint]);
}

function useClaimMagic() {
  const { account } = useEthers();

  const mint = useContractFunction(
    new Contract(Contracts[4].magic, ERC20MockInterface),
    "mint"
  );

  useEffect(() => {
    switch (mint.state.status) {
      case "Exception":
      case "Fail":
        toast.error(`Transaction failed! ${mint.state.errorMessage}`);

        return;
      case "Success":
        toast.success(`Successfully claimed 1000 MAGIC!`);

        break;
    }
  }, [mint.state.errorMessage, mint.state.status]);

  return useMemo(() => {
    const send = () => {
      mint.send(account, ethers.utils.parseEther("1000000"));
    };

    return { ...mint, send };
  }, [account, mint]);
}

const data = [
  {
    id: 1,
    token: {
      collection: { address: "0x61b468f85b2e50baa0b1729ffc99efe9ef0428f0" },
      metadata: {
        description: "Treasures",
        name: "Grin",
        image: "ipfs://Qmbyy8EWMzrSTSGG1bDNsYZfvnkcjAFNM5TXJqvsbuY8Dz/Grin.gif",
      },
      tokenId: "95",
    },
  },
  {
    id: 2,
    token: {
      collection: { address: "0x61b468f85b2e50baa0b1729ffc99efe9ef0428f0" },
      metadata: {
        description: "Treasures",
        name: "Jar of Fairies",
        image:
          "ipfs://Qmbyy8EWMzrSTSGG1bDNsYZfvnkcjAFNM5TXJqvsbuY8Dz/Jar%20of%20Fairies.gif",
      },
      tokenId: "100",
    },
  },
  {
    id: 3,
    token: {
      collection: { address: "0x6fd12312f70fa5b04d66584600f39abe31a99708" },
      metadata: {
        description: "Legion",
        name: "Assassin",
        image:
          "ipfs://QmTd8siTE6Ys2XTLNerPySYQowdeDkZjSTViYpBf54GnXx/Assassin.gif",
      },
      tokenId: "45",
    },
  },
  {
    id: 4,
    token: {
      collection: { address: "0x6fd12312f70fa5b04d66584600f39abe31a99708" },
      metadata: {
        description: "Legion",
        name: "Siege",
        image:
          "ipfs://QmTd8siTE6Ys2XTLNerPySYQowdeDkZjSTViYpBf54GnXx/Siege.gif",
      },
      tokenId: "150",
    },
  },
];

const Drawer = ({ nft, onClose }: DrawerProps) => {
  const [quantity, setQuantity] = useState("1");
  const [show, toggle] = useReducer((value) => !value, true);

  const mintToken = useMintToken(nft.address);

  const isFormDisabled = [mintToken.state.status].includes("Mining");

  useEffect(() => {
    if ([mintToken.state.status].includes("Success")) {
      toggle();
    }
  }, [mintToken.state.status]);

  return (
    <Transition.Root appear show={show} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 overflow-hidden"
        onClose={toggle}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Dialog.Overlay className="absolute inset-0 bg-gray-300 opacity-60" />

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
                <div className="h-full flex flex-col py-6 bg-white shadow-xl overflow-y-scroll">
                  <div className="px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-lg font-medium text-gray-900">
                        Mint {nft.name}
                      </Dialog.Title>
                      <div className="ml-3 h-7 flex items-center">
                        <button
                          type="button"
                          className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                          <Image
                            src={nft.source}
                            alt={nft.name}
                            layout="fill"
                            className="object-fill object-center"
                          />
                        </div>
                        <div className="mt-4 flex items-start justify-between">
                          <div>
                            <h2 className="text-lg font-medium text-gray-900">
                              <span className="sr-only">Details for </span>
                              {nft.name}
                            </h2>
                            <p className="text-sm font-medium text-gray-500">
                              {nft.collection}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {/* <div>
                          <label
                            htmlFor="price"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Price Per Item
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                              type="number"
                              name="price"
                              id="price"
                              className="form-input focus:ring-red-500 focus:border-red-500 block w-full pr-16 sm:text-sm border-gray-300 rounded-md disabled:placeholder-gray-300 disabled:text-gray-300 disabled:pointer-events-none transition-placeholder transition-text ease-linear duration-300"
                              placeholder="0.00"
                              aria-describedby="price-currency"
                              onChange={(event) => setPrice(event.target.value)}
                              value={price}
                              disabled={isFormDisabled}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span
                                className="text-gray-500 sm:text-sm"
                                id="price-currency"
                              >
                                MAGIC
                              </span>
                            </div>
                          </div>
                        </div> */}
                        {/* <div>
                          <Listbox
                            value={selectedDate}
                            onChange={setSelectedDate}
                            disabled={isFormDisabled}
                          >
                            <Listbox.Label className="block text-sm font-medium text-gray-700">
                              Expire Date
                            </Listbox.Label>
                            <div className="mt-1 relative">
                              <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:text-gray-300 disabled:pointer-events-none transition-text ease-linear duration-300">
                                <span className="block truncate">
                                  {selectedDate.label}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <SelectorIcon
                                    className="h-5 w-5 text-gray-400"
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
                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  {dates.map((date) => (
                                    <Listbox.Option
                                      key={date.id}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "text-white bg-red-600"
                                            : "text-gray-900",
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
                                                  : "text-red-600",
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
                        </div> */}
                        <div>
                          <Listbox
                            value={quantity}
                            onChange={setQuantity}
                            disabled={isFormDisabled}
                          >
                            <Listbox.Label className="block text-sm font-medium text-gray-700">
                              Quantity
                            </Listbox.Label>
                            <div className="mt-1 relative">
                              <Listbox.Button className="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm disabled:text-gray-300 disabled:pointer-events-none transition-text ease-linear duration-300">
                                <span className="block truncate">
                                  {quantity}
                                </span>
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                  <SelectorIcon
                                    className="h-5 w-5 text-gray-400"
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
                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                  {Array.from({
                                    length: Number(nft.total) || 0,
                                  }).map((_, idx) => (
                                    <Listbox.Option
                                      key={idx}
                                      className={({ active }) =>
                                        classNames(
                                          active
                                            ? "text-white bg-red-600"
                                            : "text-gray-900",
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
                                                  : "text-red-600",
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
                      </div>

                      <Button
                        isLoading={mintToken.state.status === "Mining"}
                        loadingText="Minting..."
                        onClick={() =>
                          mintToken.send(
                            nft.name,
                            Number(nft.tokenId),
                            Number(quantity)
                          )
                        }
                      >
                        Mint {nft.name}
                      </Button>
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

const Mint = () => {
  const router = useRouter();
  const [nft, setNft] = useState<Nft | null>(null);

  const claimMagic = useClaimMagic();
  // const [section] = router.query.section ?? [""];

  // const inventory = useQuery(
  //   "inventory",
  //   () =>
  //     client.getUserInventory({ id: account?.toLowerCase() ?? AddressZero }),
  //   { enabled: !!account }
  // );

  // const [data, totals] = useMemo(() => {
  //   const {
  //     listings = [],
  //     sold = [],
  //     tokens = [],
  //   } = inventory.data?.user ?? {};
  //   const totals = [...listings, ...tokens].reduce<Record<string, number>>(
  //     (acc, value) => {
  //       const { collection, tokenId } = value.token;
  //       const key = `${collection.address}-${tokenId}`;

  //       acc[key] ??= 0;
  //       acc[key] += Number(value.quantity);

  //       return acc;
  //     },
  //     {}
  //   );

  //   switch (section) {
  //     case "listed":
  //       return [listings, totals] as const;
  //     case "sold":
  //       return [sold, totals] as const;
  //     default:
  //       return [tokens, totals] as const;
  //   }
  // }, [inventory.data?.user, section]);

  // const approvals = useContractApprovals(
  //   Array.from(
  //     new Set(
  //       data.map(
  //         ({
  //           token: {
  //             collection: { address },
  //           },
  //         }) => address
  //       )
  //     )
  //   )
  // );

  const onClose = useCallback(() => setNft(null), []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 flex items-stretch overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="pt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="flex-1 text-2xl font-bold text-gray-900">Mint</h1>

            <div className="flex-1 pt-5 max-w-xs">
              <Button
                isLoading={claimMagic.state.status === "Mining"}
                loadingText="Claiming..."
                onClick={() => claimMagic.send()}
              >
                Claim 1000000 MAGIC
              </Button>
            </div>

            {/* <div className="mt-3 sm:mt-2">
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Select a tab
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                  defaultValue="Collected"
                >
                  <option>Collected</option>
                  <option>Listed</option>
                  <option>Sold</option>
                </select>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center border-b border-gray-200">
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
                                ? "border-red-500 text-red-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
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
            </div> */}

            <section className="mt-8 pb-16">
              <ul
                role="list"
                className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-4 xl:gap-x-8"
              >
                {data.map(({ id, token }) => (
                  <li key={id} className="relative">
                    <div className="group block w-full aspect-w-1 aspect-h-1 rounded-sm overflow-hidden sm:aspect-w-3 sm:aspect-h-3 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-red-500">
                      <Image
                        alt={token.metadata?.name ?? ""}
                        className={
                          "object-fill object-center pointer-events-none group-hover:opacity-80"
                        }
                        layout="fill"
                        src={generateIpfsLink(token.metadata?.image ?? "")}
                      />
                      <button
                        type="button"
                        className="absolute inset-0 focus:outline-none"
                        onClick={() =>
                          setNft({
                            address: token.collection.address,
                            collection: token.metadata?.description || "",
                            name: token.metadata?.name || "",
                            // listing: pricePerItem
                            //   ? { expires, pricePerItem, quantity }
                            //   : undefined,
                            total: 5,
                            //   totals[
                            //     `${token.collection.address}-${token.tokenId}`
                            //   ],
                            source: generateIpfsLink(
                              token.metadata?.image || ""
                            ),
                            tokenId: token.tokenId,
                          })
                        }
                      >
                        <span className="sr-only">
                          View details for {token.metadata?.name}
                        </span>
                      </button>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p className="block text-sm font-medium text-gray-900 truncate pointer-events-none">
                          {token.metadata?.name}
                        </p>
                        <p className="block text-sm font-medium text-gray-500 pointer-events-none">
                          {token.metadata?.description}
                        </p>
                      </div>
                      {/* <p className="text-xs font-medium text-gray-500 pointer-events-none">
                        {quantity}
                      </p> */}
                    </div>
                  </li>
                ))}
                {/* {data.length === 0 && <div>Nothing to see here...</div>} */}
              </ul>
            </section>
          </div>
        </main>

        {nft ? (
          <Drawer
            // canCancelListing={Boolean(router.query.section?.[0])}
            // needsContractApproval={!Boolean(approvals[nft.address])}
            nft={nft}
            onClose={onClose}
          />
        ) : null}
      </div>
    </div>
  );
};

Mint.showSamuraiBg = false;

export default Mint;
