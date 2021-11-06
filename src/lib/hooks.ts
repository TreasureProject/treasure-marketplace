import * as abis from "./abis";
import { ChainId } from "@yuyao17/corefork";
import { Contract } from "ethers";
import { Contracts } from "../const";
import { Interface } from "@ethersproject/abi";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import {
  useContractCalls,
  useContractFunction,
  useEthers,
} from "@yuyao17/corefork";
import { useQueryClient } from "react-query";
import plur from "plur";

export function useApproveContract(contract: string) {
  const approve = useContractFunction(
    // TODO: Determine if nft collection is erc1155 or erc721
    new Contract(contract, abis.erc1155),
    "setApprovalForAll"
  );

  useEffect(() => {
    switch (approve.state.status) {
      case "Exception":
      case "Fail":
        toast.error(
          `An error occurred while trying set approval on the contract: ${contract}\n${approve.state.errorMessage} `
        );
    }
  }, [approve.state, contract]);

  return useMemo(() => {
    const send = () =>
      approve.send(Contracts[ChainId.Rinkeby].marketplace, true);

    return { ...approve, send };
  }, [approve]);
}

export function useContractApprovals(addresses: string[]) {
  const { account } = useEthers();
  const approvals = useContractCalls(
    addresses.map((address) => ({
      // TODO: Determine if nft collection is erc1155 or erc721
      abi: new Interface(abis.erc1155),
      address,
      method: "isApprovedForAll",
      args: [account, Contracts[ChainId.Rinkeby].marketplace],
    })) ?? []
  );

  return approvals
    .filter(Boolean)
    .flat()
    .reduce<Record<string, boolean>>((acc, value, index) => {
      const address = addresses[index];

      if (address) {
        acc[address] = value;
      }

      return acc;
    }, {});
}

export function useCancelListing() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const cancel = useContractFunction(
    new Contract(Contracts[ChainId.Rinkeby].marketplace, abis.marketplace),
    "cancelListing"
  );

  useEffect(() => {
    switch (cancel.state.status) {
      case "Exception":
      case "Fail":
        if (cancel.state.errorMessage?.includes("not listed item")) {
          toast.error("You do not have that item listed.");

          break;
        }

        toast.error(`Transaction failed! ${cancel.state.errorMessage}`);

        return;
      case "Success":
        toast.success(`Successfully canceled the listing for ${name}!`);

        queryClient.invalidateQueries("inventory", { refetchInactive: true });
        queryClient.invalidateQueries("listed", { refetchInactive: true });

        break;
    }
  }, [cancel.state.errorMessage, cancel.state.status, name, queryClient]);

  return useMemo(() => {
    const send = (name: string, address: string, tokenId: number) => {
      setName(name);

      cancel.send(address, tokenId);
    };

    return { ...cancel, send };
  }, [cancel]);
}

export function useCreateListing() {
  const [{ name, quantity }, setInfo] = useState({ name: "", quantity: 0 });
  const queryClient = useQueryClient();

  const sell = useContractFunction(
    new Contract(Contracts[ChainId.Rinkeby].marketplace, abis.marketplace),
    "createListing"
  );

  useEffect(() => {
    switch (sell.state.status) {
      case "Exception":
      case "Fail":
        if (sell.state.errorMessage?.includes("already listed")) {
          toast.error(
            "Your item is already listed, please update your listing."
          );

          break;
        }

        toast.error(`Transaction failed! ${sell.state.errorMessage}`);

        return;
      case "Success":
        toast.success(
          `Successfully listed ${quantity} ${plur(name, quantity)} for sale!`
        );

        queryClient.invalidateQueries("inventory", { refetchInactive: true });
        queryClient.invalidateQueries("listed", { refetchInactive: true });

        break;
    }
  }, [name, quantity, queryClient, sell.state.errorMessage, sell.state.status]);

  return useMemo(() => {
    const send = (
      name: string,
      address: string,
      tokenId: number,
      quantity: number,
      ...rest: unknown[]
    ) => {
      setInfo({ name, quantity });
      sell.send(address, tokenId, quantity, ...rest);
    };

    return { ...sell, send };
  }, [sell]);
}
