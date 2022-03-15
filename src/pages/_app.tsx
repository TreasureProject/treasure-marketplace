import "../css/tailwind.css";

import { Fragment, useEffect, useState } from "react";
import Head from "next/head";
import { ChainId, DAppProvider } from "@usedapp/core";
import { ReactQueryDevtools } from "react-query/devtools";
import { QueryClient, QueryClientProvider } from "react-query";
import { resolveValue, Toaster } from "react-hot-toast";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/outline";
import { SSRProvider } from "@react-aria/ssr";
import { ThemeProvider } from "next-themes";

import Header from "../components/Header";
import { Spinner } from "../components/Spinner";
import { MagicProvider } from "../context/magicContext";
import Footer from "../components/Footer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 2500,
      refetchOnWindowFocus: false,
    },
  },
});

const config = {
  readOnlyChainId: ChainId.Arbitrum,
  readOnlyUrls: {
    [ChainId.ArbitrumRinkeby]:
      "https://arb-rinkeby.g.alchemy.com/v2/PDUCdHLoNrdDJwgVvCNPTx7MrHuQ0uBg",
    [ChainId.Arbitrum]: `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  },
};

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Treasure Marketplace</title>
        <meta name="title" content="Treasure Marketplace" />
        <meta
          name="description"
          content="Arbitrum native NFT marketplace, created by TreasureDAO"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="http://marketplace.treasure.lol/" />
        <meta property="og:title" content="Treasure Marketplace" />
        <meta
          property="og:description"
          content="Arbitrum native NFT marketplace, created by TreasureDAO"
        />
        <meta
          property="og:image"
          content="http://marketplace.treasure.lol/img/seoBanner.png"
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:url"
          content="http://marketplace.treasure.lol/"
        />
        <meta property="twitter:title" content="Treasure Marketplace" />
        <meta
          property="twitter:description"
          content="Arbitrum native NFT marketplace, created by TreasureDAO"
        />
        <meta
          property="twitter:image"
          content="http://marketplace.treasure.lol/img/seoBanner.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
        <script async src="https://cdn.splitbee.io/sb.js"></script>
      </Head>
      <ThemeProvider attribute="class">
        <SSRProvider>
          <DAppProvider config={config}>
            <MagicProvider>
              <QueryClientProvider client={queryClient}>
                <Main Component={Component} pageProps={pageProps} />
                <ReactQueryDevtools />
              </QueryClientProvider>
            </MagicProvider>
          </DAppProvider>
          <Toaster position="bottom-left">
            {(t) => (
              <Transition
                show={t.visible}
                as={Fragment}
                enter="transform ease-out duration-300 transition"
                enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
                enterTo="translate-y-0 opacity-100 sm:translate-x-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-center items-center">
                      <div className="flex-shrink-0">
                        {(() => {
                          switch (t.type) {
                            case "success":
                              return (
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                              );
                            case "error":
                              return (
                                <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
                              );
                            case "loading":
                              return (
                                <Spinner className="h-6 w-6 text-blue-500" />
                              );
                            default:
                              return (
                                <CheckCircleIcon className="h-6 w-6 text-yellow-500" />
                              );
                          }
                        })()}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className="text-sm text-gray-500">
                          {resolveValue(t.message, t)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            )}
          </Toaster>
        </SSRProvider>
      </ThemeProvider>
    </>
  );
}

const Main = ({ pageProps, Component }) => {
  const [mounted, setMounted] = useState(false);

  // When mounted on client, now we can show the UI
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen relative flex flex-col dark:bg-gray-900">
      <Header />
      <Component {...pageProps} />
      <Footer />
    </div>
  );
};

export default MyApp;
