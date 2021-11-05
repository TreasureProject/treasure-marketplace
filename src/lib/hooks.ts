import * as abis from "./abis";
import { ChainId } from "@yuyao17/corefork";
import { Contract } from "ethers";
import { Contracts } from "../const";
import { GetUserTokensQuery } from "../../generated/graphql";
import { Interface } from "@ethersproject/abi";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useContractCalls, useContractFunction } from "@yuyao17/corefork";
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
          `An error occurred while trying set approval on the contract: ${contract}`
        );
    }
  }, [approve.state]);

  return useMemo(() => {
    const send = () =>
      approve.send(Contracts[ChainId.Rinkeby].marketplace, true);

    return { ...approve, send };
  }, [approve]);
}

export function useContractApprovals(data?: GetUserTokensQuery) {
  const approvals = useContractCalls(
    data?.user?.tokens.map(({ token }) => ({
      // TODO: Determine if nft collection is erc1155 or erc721
      abi: new Interface(abis.erc1155),
      address: token.collection.address,
      method: "isApprovedForAll",
      args: [data?.user?.id, Contracts[ChainId.Rinkeby].marketplace],
    })) ?? []
  );

  return approvals
    .filter(Boolean)
    .flat()
    .reduce<Record<string, boolean>>((acc, value, index) => {
      const { token: { collection: { address = null } = {} } = {} } =
        data?.user?.tokens[index] ?? {};

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

        toast.error("An error occurred while trying to create your listing.");

        return;
      case "Success":
        toast.success(
          `Successfully listed ${quantity} ${plur(name, quantity)} for sale!`
        );

        queryClient.invalidateQueries("inventory");

        break;
    }
  }, [name, quantity, sell.state.status]);

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
