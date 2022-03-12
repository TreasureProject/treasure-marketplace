import { useState, Fragment, useEffect } from "react";
import {
  MenuIcon,
  XIcon,
  SpeakerphoneIcon,
  ExclamationIcon,
  ExternalLinkIcon,
} from "@heroicons/react/outline";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import {
  useEthers,
  shortenAddress,
  ChainId,
  getChainName,
} from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import { formatNumber } from "../utils";
import { Modal } from "./Modal";
import { Item } from "react-stately";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { useRouter } from "next/router";
import { useMagic } from "../context/magicContext";
import { coreCollections } from "../const";
import classNames from "clsx";
import toast from "react-hot-toast";
import MetaMaskSvg from "../../public/img/metamask.svg";
import WalletConnectSvg from "../../public/img/walletconnect.svg";
import Coinbase from "../../public/img/coinbase.png";

import Image from "next/image";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { useCollections } from "../lib/hooks";
import { getCollectionSlugFromName } from "../utils";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";

const walletLink = new WalletLinkConnector({
  url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  appName: "Treasure Marketplace",
  appLogoUrl: "https://marketplace.treasure.lol/favicon-32x32.png",
  supportedChainIds: [ChainId.Arbitrum, ChainId.ArbitrumRinkeby],
});

const walletconnect = new WalletConnectConnector({
  rpc: {
    [ChainId.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
    [ChainId.ArbitrumRinkeby]:
      "https://arb-rinkeby.g.alchemy.com/v2/PDUCdHLoNrdDJwgVvCNPTx7MrHuQ0uBg",
  },
  qrcode: true,
});

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    activateBrowserWallet,
    account,
    activate,
    chainId: currentChainId,
  } = useEthers();
  const [isOpenWalletModal, setIsOpenWalletModal] = useState(false);

  const router = useRouter();
  const { address } = router.query;

  const { magicBalance, sushiModalOpen, setSushiModalOpen } = useMagic();

  useEffect(() => {
    // Close dialog on sidebar click
    setMobileMenuOpen(false);
  }, [address]);

  const onClose = () => setIsOpenWalletModal(false);

  const data = useCollections();
  const collectionName =
    data.find((item) => item.address === address)?.name ?? "";

  const showBwWarning = [
    "Unpilgrimaged Legion Auxiliary",
    "Unpilgrimaged Legion Genesis",
  ].includes(collectionName ?? "");

  const switchToArbitrum = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa4b1" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0xa4b1",
                  rpcUrls: ["https://arb1.arbitrum.io/rpc"],
                  chainName: "Arbitrum One",
                  blockExplorerUrls: ["https://arbiscan.io"],
                  nativeCurrency: {
                    name: "AETH",
                    symbol: "AETH",
                    decimals: 18,
                  },
                },
              ],
            });
          } catch (addError) {
            toast.error("Something went wrong while switching networks.");
          }
        }
      }
    }
  };

  return (
    <div>
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 flex z-40 lg:hidden"
          onClose={setMobileMenuOpen}
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
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative max-w-xs w-full bg-white dark:bg-gray-900 shadow-xl flex flex-col overflow-y-auto">
              <div className="px-4 pt-5 pb-2 flex">
                <button
                  type="button"
                  className="-m-2 p-2 rounded-md inline-flex items-center justify-center text-gray-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="py-6 px-4 space-y-6 flex-1">
                {data.map((page) => {
                  const slugOrAddress =
                    getCollectionSlugFromName(page.name) ?? page.address;

                  return (
                    <div key={page.name} className="flow-root">
                      <Link href={`/collection/${slugOrAddress}`} passHref>
                        <a className="-m-2 p-2 block font-medium text-gray-900 dark:text-gray-200">
                          {page.name}
                        </a>
                      </Link>
                    </div>
                  );
                })}
              </div>
              {account && (
                <div className="flex-shrink-0 flex flex-col items-center border-t border-gray-200 dark:border-gray-500 p-4">
                  <div className="w-full items-center rounded-lg dark:bg-gray-500 bg-red-500 p-0.5 whitespace-nowrap font-bold select-none pointer-events-auto mx-2 flex-col">
                    <div className="px-2 py-3 text-bold flex items-center justify-center text-xs sm:text-sm">
                      <span className="text-white block">
                        {formatNumber(parseFloat(formatEther(magicBalance)))}
                      </span>{" "}
                      <span className="text-white block ml-2">$MAGIC</span>
                    </div>
                    <div className="flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg dark:bg-gray-800 bg-red-600 text-white text-xs sm:text-sm">
                      {shortenAddress(account)}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSushiModalOpen(true);
                    }}
                    className="text-[0.5rem] block underline place-self-end mt-2 dark:text-gray-300"
                  >
                    Buy more MAGIC &gt;
                  </button>
                </div>
              )}
            </div>
          </Transition.Child>
        </Dialog>
      </Transition.Root>
      <div className="fixed w-full shadow z-30">
        <div className="z-10 border-t-4 border-red-500"></div>
        <header className="relative">
          <nav aria-label="Top">
            <div className="bg-white dark:bg-black shadow-sm">
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                  <div className="hidden h-full lg:flex lg:items-center">
                    <div className="h-full justify-center space-x-6 mr-6 hidden xl:flex">
                      {data
                        .filter((collection) =>
                          coreCollections.includes(collection.name)
                        )
                        .map((collection) => {
                          const active = collection.address === address;
                          const slugOrAddress =
                            getCollectionSlugFromName(collection.name) ??
                            collection.address;

                          return (
                            <Link
                              href={`/collection/${slugOrAddress}`}
                              passHref
                              key={collection.name}
                            >
                              <a
                                className={classNames(
                                  "flex gap-2 items-center text-sm font-medium dark:hover:text-gray-200 hover:text-gray-800",
                                  {
                                    "dark:text-gray-200 text-red-700": active,
                                    "dark:text-gray-500 text-gray-700": !active,
                                  }
                                )}
                              >
                                {collection.name}
                                {collection.name === "BattleFly" ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    NEW
                                  </span>
                                ) : null}
                              </a>
                            </Link>
                          );
                        })}
                    </div>
                    <div className="bottom-0 inset-x-0">
                      <SearchAutocomplete
                        label="Search Collection"
                        allowsCustomValue
                        onSelectionChange={(name) => {
                          const targetCollection = data.find(
                            (collection) => collection.name === name
                          );

                          if (targetCollection) {
                            const slugOrAddress =
                              getCollectionSlugFromName(
                                targetCollection.name
                              ) ?? targetCollection.address;

                            router.push(`/collection/${slugOrAddress}`);
                          }
                        }}
                      >
                        {data.map((collection) => (
                          <Item key={collection.name}>{collection.name}</Item>
                        )) ?? []}
                      </SearchAutocomplete>
                    </div>
                  </div>

                  <div className="lg:flex-1 flex items-center lg:hidden">
                    <button
                      type="button"
                      className="-ml-2 bg-white dark:bg-transparent p-2 rounded-md text-gray-400"
                      onClick={() => setMobileMenuOpen(true)}
                    >
                      <span className="sr-only">Open menu</span>
                      <MenuIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex-1 flex items-center justify-end">
                    <button
                      className="text-gray-700 block px-4 py-2 text-sm dark:text-gray-200"
                      onClick={() => setSushiModalOpen(true)}
                    >
                      Purchase $MAGIC
                    </button>
                    <div className="flex items-center">
                      {account ? (
                        <div className="w-auto items-center rounded-lg dark:bg-gray-500 bg-red-500 p-0.5 whitespace-nowrap font-bold select-none pointer-events-auto mx-2 hidden sm:flex">
                          <div className="px-2 sm:px-3 py-1 sm:py-2 text-bold flex items-center text-xs sm:text-sm">
                            <span className="text-white block">
                              {formatNumber(
                                parseFloat(formatEther(magicBalance))
                              )}
                            </span>{" "}
                            <span className="text-white block ml-2">
                              $MAGIC
                            </span>
                          </div>
                          <div className="flex items-center px-2 sm:px-3 py-2 rounded-lg dark:bg-gray-800 bg-red-600 text-white text-xs sm:text-sm">
                            {shortenAddress(account)}
                          </div>
                        </div>
                      ) : (
                        <button
                          className="mx-2 inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-red-300 dark:border-gray-500 rounded text-xs md:text-sm font-bold text-white dark:text-gray-300 bg-red-500 dark:bg-gray-800 hover:bg-red-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-gray-700"
                          onClick={() => setIsOpenWalletModal(true)}
                        >
                          Connect Wallet
                        </button>
                      )}

                      <div className="ml-4 flow-root sm:border-l border-gray-200 pl-4 sm:pl-6 text-sm">
                        <Link href="/activity" passHref>
                          <a className="hover:text-gray-900 text-gray-500 dark:hover:text-gray-200">
                            Activity
                          </a>
                        </Link>
                      </div>
                      <div className="ml-4 flow-root sm:border-l border-gray-200 pl-4 sm:pl-6 text-sm">
                        <Link href="/inventory" passHref>
                          <a className="hover:text-gray-900 text-gray-500 dark:hover:text-gray-200">
                            Inventory
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </header>
        {currentChainId &&
          currentChainId !== ChainId.Arbitrum &&
          process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
            <div className="bg-yellow-600">
              <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div className="flex sm:items-center lg:justify-between flex-col space-y-2 sm:space-y-0 sm:flex-row">
                  <div className="flex-1 flex items-center">
                    <span className="flex p-2 rounded-lg bg-yellow-800">
                      <SpeakerphoneIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="ml-3 font-medium text-white truncate">
                      <span className="lg:hidden">
                        Please switch to Arbitrum.
                      </span>
                      <span className="hidden lg:block">
                        You are currently on the {getChainName(currentChainId)}{" "}
                        Network. Please switch to Arbitrum.
                      </span>
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-full sm:mt-0 sm:w-auto">
                    <button
                      onClick={switchToArbitrum}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-yellow-600 bg-white hover:bg-yellow-50"
                    >
                      Switch Networks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        {currentChainId &&
          currentChainId === ChainId.Arbitrum &&
          showBwWarning &&
          process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && (
            <div className="bg-red-600">
              <div className="py-3 px-3 sm:px-6 lg:px-8">
                <div className="flex sm:items-center lg:justify-between flex-col space-y-2 sm:space-y-0 sm:flex-row">
                  <div className="flex-1 flex items-center">
                    <span className="flex p-2 rounded-lg bg-red-800">
                      <SpeakerphoneIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </span>
                    <p className="ml-3 font-medium text-white">
                      <span className="lg:hidden">
                        Unpilgrimaged Legions have no utility in Bridgeworld.
                      </span>
                      <span className="hidden lg:block">
                        Unpilgrimaged Legions have no utility in Bridgeworld.
                        They MUST first go through Pilgrimage. Legions that have
                        undergone Pilgrimage will be listed under the{" "}
                        <Link href="/collection/legion-auxiliary">
                          <a className="hover:underline">
                            &apos;Legion Auxiliary&apos;
                          </a>
                        </Link>{" "}
                        or{" "}
                        <Link href="/collection/legion-genesis">
                          <a className="hover:underline">
                            &apos;Legion Genesis&apos;
                          </a>
                        </Link>{" "}
                        collection.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>
      <Modal
        title="Convert between ETH and MAGIC"
        onClose={() => setSushiModalOpen(false)}
        isOpen={sushiModalOpen}
        className="lg:max-w-3xl"
      >
        <div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationIcon
                  className="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-3">
                <p className="text-[0.7rem] text-left lg:text-xs text-yellow-700">
                  As bridging services involve third parties, there may be rare
                  instances where funds are stuck for up to 3 days (max) if
                  there is an outage from the service provider. However, the
                  users funds are always safely locked on the chain.
                </p>
              </div>
            </div>
          </div>

          <div className="h-[400px] sm:h-[610px] mt-4">
            <iframe
              src="https://li.finance/embed?fromChain=arb&toChain=arb&toToken=0x539bde0d7dbd336b79148aa742883198bbf60342"
              width="100%"
              style={{
                border: 0,
                borderRadius: "10px",
                margin: "0px auto",
                display: "block",
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            />
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isOpenWalletModal}
        onClose={onClose}
        className="md:max-w-3xl sm:max-w-xl"
        hideCloseIcon
      >
        <div className="grid grid-cols-1 divide-y-[1px] sm:divide-y-0 sm:grid-cols-2">
          <div className="flex justify-center px-4 py-3">
            <button
              className="flex items-center justify-center flex-col hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={() => {
                activateBrowserWallet();
                onClose();
              }}
            >
              <p className="md:text-xl sm:text-lg mb-2">MetaMask</p>
              <p className="text-gray-400 font-bold sm:text-sm text-xs mb-8">
                Connect to your MetaMask Wallet
              </p>
              <Image
                src={MetaMaskSvg.src}
                alt="MetaMask"
                height={48}
                width={48}
              />
            </button>
          </div>
          <div className="flex justify-center px-4 py-3">
            <button
              className="flex items-center justify-center flex-col hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={async () => {
                try {
                  await activate(walletconnect);
                } catch (e) {
                  toast.error(e.message);
                } finally {
                  onClose();
                }
              }}
            >
              <p className="md:text-xl sm:text-lg mb-2">WalletConnect</p>
              <p className="text-gray-400 font-bold sm:text-sm text-xs mb-8">
                Scan with WalletConnect to connect
              </p>
              <Image
                src={WalletConnectSvg.src}
                alt="WalletConnect"
                height={48}
                width={48}
              />
            </button>
          </div>
          <div className="sm:col-span-2 sm:mt-2 flex justify-center px-4 py-3">
            <button
              className="flex items-center justify-center flex-col hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              onClick={async () => {
                try {
                  await activate(walletLink);
                } catch (e) {
                  toast.error(e.message);
                } finally {
                  onClose();
                }
              }}
            >
              <p className="md:text-xl sm:text-lg mb-2">Coinbase Wallet</p>
              <p className="text-gray-400 font-bold sm:text-sm text-xs mb-8">
                Scan with Coinbase Wallet to connect
              </p>
              <Image
                src={Coinbase.src}
                alt="Coinbase Wallet"
                height={48}
                width={48}
              />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Header;
