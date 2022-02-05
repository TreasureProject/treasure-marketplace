import * as React from "react";
import { useEthers, useTokenBalance } from "@usedapp/core";
import { Contracts } from "../const";
import { Zero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { useChainId } from "../lib/hooks";
import { useCoingeckoPrice } from "@usedapp/coingecko";

const BalanceContext = React.createContext<null | {
  magicBalance: BigNumber;
  usdPrice: string;
  ethPrice: string;
  sushiModalOpen: boolean;
  setSushiModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>(null);

export const MagicProvider = ({ children }) => {
  const { account } = useEthers();
  const chainId = useChainId();

  const [sushiModalOpen, setSushiModalOpen] = React.useState(false);

  const ethPrice = useCoingeckoPrice("magic", "eth") ?? "0";

  const usdPrice = useCoingeckoPrice("magic", "usd") ?? "0";

  // crashes if you don't have a valid chainId (all chains except mainnet and arbi)
  const magicBalance =
    useTokenBalance(Contracts[chainId].magic, account) || Zero;

  return (
    <BalanceContext.Provider
      value={{
        magicBalance,
        usdPrice,
        ethPrice,
        sushiModalOpen,
        setSushiModalOpen,
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};

export const useMagic = () => {
  const balance = React.useContext(BalanceContext);

  if (!balance) {
    throw new Error("useMagic must be used within a MagicProvider");
  }

  return balance;
};
