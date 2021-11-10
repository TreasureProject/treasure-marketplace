import * as abis from "./abis";
import { ChainId, ERC20Interface } from "@yuyao17/corefork";
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
import { MaxUint256 } from "@ethersproject/constants";

export function useApproveContract(
  contract: string,
  standard: "ERC721" | "ERC1155"
) {
  const approve = useContractFunction(
    new Contract(contract, standard === "ERC721" ? abis.erc721 : abis.erc1155),
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

export function useContractApprovals(
  collections: Array<{ address: string; standard: "ERC721" | "ERC1155" }>
) {
  const { account } = useEthers();
  const approvals = useContractCalls(
    collections.map(({ address, standard }) => ({
      abi: new Interface(standard === "ERC721" ? abis.erc721 : abis.erc1155),
      address,
      method: "isApprovedForAll",
      args: [account, Contracts[ChainId.Rinkeby].marketplace],
    })) ?? []
  );

  return approvals
    .filter(Boolean)
    .flat()
    .reduce<Record<string, boolean>>((acc, value, index) => {
      const { address } = collections[index];

      if (address) {
        acc[address] = value;
      }

      return acc;
    }, {});
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

export function useRemoveListing() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const remove = useContractFunction(
    new Contract(Contracts[ChainId.Rinkeby].marketplace, abis.marketplace),
    "cancelListing"
  );

  useEffect(() => {
    switch (remove.state.status) {
      case "Exception":
      case "Fail":
        if (remove.state.errorMessage?.includes("not listed item")) {
          toast.error("You do not have that item listed.");

          break;
        }

        toast.error(`Transaction failed! ${remove.state.errorMessage}`);

        return;
      case "Success":
        toast.success(`Successfully removed the listing for ${name}!`);

        queryClient.invalidateQueries("inventory", { refetchInactive: true });

        break;
    }
  }, [remove.state.errorMessage, remove.state.status, name, queryClient]);

  return useMemo(() => {
    const send = (name: string, address: string, tokenId: number) => {
      setName(name);

      remove.send(address, tokenId);
    };

    return { ...remove, send };
  }, [remove]);
}

export function useBuyItem() {
  const queryClient = useQueryClient();

  const { send: sendBuy, state } = useContractFunction(
    new Contract(Contracts[ChainId.Rinkeby].marketplace, abis.marketplace),
    "buyItem"
  );

  useEffect(() => {
    switch (state.status) {
      case "Exception":
      case "Fail":
        toast.error(`Transaction failed! ${state.errorMessage}`);
        return;
      case "Success":
        toast.success("Successfully purchased!");
        queryClient.invalidateQueries("listings", { refetchInactive: true });
        break;
    }
  }, [queryClient, state.errorMessage, state.status]);

  return useMemo(() => {
    const send = (
      address: string,
      ownerAddress: string,
      tokenId: number,
      quantity: number
    ) => {
      sendBuy(address, tokenId, ownerAddress, quantity);
    };

    return { send, state };
  }, [sendBuy, state]);
}

export function useUpdateListing() {
  const [{ name, quantity }, setInfo] = useState({ name: "", quantity: 0 });
  const queryClient = useQueryClient();

  const update = useContractFunction(
    new Contract(Contracts[ChainId.Rinkeby].marketplace, abis.marketplace),
    "updateListing"
  );

  useEffect(() => {
    switch (update.state.status) {
      case "Exception":
      case "Fail":
        if (update.state.errorMessage?.includes("not listed item")) {
          toast.error("You do not have that item listed.");

          break;
        }

        toast.error(`Transaction failed! ${update.state.errorMessage}`);

        return;
      case "Success":
        toast.success(
          `Successfully listed ${quantity} ${plur(name, quantity)} for sale!`
        );

        queryClient.invalidateQueries("inventory", { refetchInactive: true });

        break;
    }
  }, [
    name,
    quantity,
    queryClient,
    update.state.errorMessage,
    update.state.status,
  ]);

  return useMemo(() => {
    const send = (
      name: string,
      address: string,
      tokenId: number,
      quantity: number,
      ...rest: unknown[]
    ) => {
      setInfo({ name, quantity });
      update.send(address, tokenId, quantity, ...rest);
    };

    return { ...update, send };
  }, [update]);
}

export const useApproveMagic = () => {
  const contract = new Contract(Contracts[4].magic, ERC20Interface);
  const { send, state } = useContractFunction(contract, "approve");

  return {
    send: () => send(Contracts[4].marketplace, MaxUint256.toString()),
    state,
  };
};
