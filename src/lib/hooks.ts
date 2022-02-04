import type { Nft, targetNftT } from "../types";

import * as abis from "./abis";
import {
  ChainId,
  ERC20Interface,
  useContractCalls,
  useContractFunction,
  useEthers,
} from "@yuyao17/corefork";
import { BigNumber, Contract } from "ethers";
import { Contracts } from "../const";
import { Interface } from "@ethersproject/abi";
import { generateIpfsLink } from "../utils";
import { toast } from "react-hot-toast";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { MaxUint256 } from "@ethersproject/constants";
import plur from "plur";
import { TokenStandard } from "../../generated/queries.graphql";
import { marketplace } from "./client";

type WebhookBody = {
  address: string;
  collection: string;
  expires?: number;
  image: string;
  tokenId: string;
  name: string;
  price: string;
  quantity: number;
  updates?: Pick<WebhookBody, "expires" | "price" | "quantity">;
  user: string;
};

function callWebhook(
  type: "list" | "sold" | "update",
  { image, ...body }: WebhookBody
) {
  fetch(`/api/webhook/${type}`, {
    method: "post",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...body,
      image: image.replace(/ /g, "%20"),
    }),
  });
}

export function useChainId() {
  const { chainId } = useEthers();

  switch (chainId) {
    case ChainId.Arbitrum:
    case ChainId.Rinkeby:
      return chainId;
    default:
      return ChainId.Arbitrum;
  }
}

export type CollectionItem = {
  name: string;
  address: string;
};

export type Collections = {
  [key: number]: CollectionItem[];
};

export const collections: Collections = {
  [ChainId.Rinkeby]: [
    {
      name: "Extra Life",
      address: "0x5e6ae51147d1ec18edccae516a59fb0a26a0b48f",
    },
    {
      name: "Keys",
      address: "0x25ee208b4f8636b5ceaafdee051bf0bfe514f5f6",
    },
    // Note: This contract doesn't exist on Rinkeby currently
    {
      name: "Legions",
      address: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1",
    },
    {
      name: "Legacy Legions",
      address: "0x6fd12312f70fa5b04d66584600f39abe31a99708",
    },
    {
      name: "Legacy Legions Genesis",
      address: "0xac2f8732a67c15bf81f8a6181364ce753e915037",
    },
    // {
    //   name: "Life",
    //   address: "#"
    // },
    {
      name: "Seed of Life",
      address: "0x6a67fbf40142e3db2e6a950a4d48b0eb41107ce8",
    },
    {
      name: "Smol Bodies",
      address: "0x9e638bfe78b372b8f5cc63cf6b01b90f568496cb",
    },
    {
      name: "Smol Bodies Pets",
      address: "0xcacdCFDe05f5FB62fb49924DC6d5c632a1746C62",
    },
    {
      name: "Smol Brains",
      address: "0x4feea06250d9f315a6a454c9c8a7fcbcf8701210",
    },
    {
      name: "Smol Brains Land",
      address: "0xe42c57ab8e093d21e52cb07b5f32b1b106cdbfe4",
    },
    {
      name: "Smol Brains Pets",
      address: "0xfF8B8d23581dF7Da74410A470bB56357772E213e",
    },
    {
      name: "Treasures",
      address: "0x61b468f85b2e50baa0b1729ffc99efe9ef0428f0",
    },
    {
      name: "Smol Cars",
      address: "0x16bdf0b2d8bb8e98aecb32e004febf9653da5f43",
    },
  ],
  [ChainId.Arbitrum]: [
    {
      name: "Extra Life",
      address: "0x21e1969884d477afd2afd4ad668864a0eebd644c",
    },
    {
      name: "Keys",
      address: "0xf0a35ba261ece4fc12870e5b7b9e7790202ef9b5",
    },
    {
      name: "Legions",
      address: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1",
    },
    {
      name: "Legacy Legions",
      address: "0x658365026d06f00965b5bb570727100e821e6508",
    },
    {
      name: "Legacy Legions Genesis",
      address: "0xe83c0200e93cb1496054e387bddae590c07f0194",
    },
    {
      name: "Smol Bodies",
      address: "0x17dacad7975960833f374622fad08b90ed67d1b5",
    },
    {
      name: "Smol Bodies Pets",
      address: "0xae0d0c4cc3335fd49402781e406adf3f02d41bca",
    },
    {
      name: "Smol Brains",
      address: "0x6325439389e0797ab35752b4f43a14c004f22a9c",
    },
    {
      name: "Smol Brains Land",
      address: "0xd666d1cc3102cd03e07794a61e5f4333b4239f53",
    },
    {
      name: "Smol Brains Pets",
      address: "0xf6cc57c45ce730496b4d3df36b9a4e4c3a1b9754",
    },
    {
      name: "Smol Cars",
      address: "0xb16966dad2b5a5282b99846b23dcdf8c47b6132c",
    },
    {
      name: "Treasures",
      address: "0xebba467ecb6b21239178033189ceae27ca12eadf",
    },
    {
      name: "Seed of Life",
      address: "0x3956c81a51feaed98d7a678d53f44b9166c8ed66",
    },
  ],
};

export function useCollections(): Array<{ address: string; name: string }> {
  const chainId = useChainId();
  const { data, isError } = useQuery(
    ["collections"],
    () => marketplace.getCollections(),
    { refetchInterval: false }
  );

  return isError
    ? collections[chainId]
    : data?.collections.map((item) => ({
        address: item.contract,
        name: item.name,
      })) ?? collections[chainId];
}

export function useTransferNFT(contract: string, standard: TokenStandard) {
  const isERC721 = standard === TokenStandard.ERC721;

  const transfer = useContractFunction(
    new Contract(contract, isERC721 ? abis.erc721 : abis.erc1155),
    isERC721 ? "safeTransferFrom(address,address,uint256)" : "safeTransferFrom"
  );

  useEffect(() => {
    switch (transfer.state.status) {
      case "Exception":
      case "Fail":
        toast.error(
          `An error occurred while trying to transfer: ${contract}\n${transfer.state.errorMessage} `
        );
      case "Success":
        toast.success(`Successfully transferred!`);
    }
  }, [transfer.state, contract]);

  return transfer;
}

export function useApproveContract(contract: string, standard: TokenStandard) {
  const chainId = useChainId();

  const approve = useContractFunction(
    new Contract(
      contract,
      standard === TokenStandard.ERC721 ? abis.erc721 : abis.erc1155
    ),
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
    const send = () => approve.send(Contracts[chainId].marketplace, true);

    return { ...approve, send };
  }, [approve, chainId]);
}

export function useContractApprovals(
  collections: Array<{ contract: string; standard: TokenStandard }>
) {
  const { account } = useEthers();
  const chainId = useChainId();

  const approvals = useContractCalls(
    collections.map(({ contract, standard }) => ({
      abi: new Interface(standard === "ERC721" ? abis.erc721 : abis.erc1155),
      address: contract,
      method: "isApprovedForAll",
      args: [account, Contracts[chainId].marketplace],
    })) ?? []
  );

  return approvals
    .filter(Boolean)
    .flat()
    .reduce<Record<string, boolean>>((acc, value, index) => {
      const { contract } = collections[index];

      if (contract) {
        acc[contract] = value;
      }

      return acc;
    }, {});
}

export function useCreateListing() {
  const [{ nft: { name = "" } = {}, quantity }, setInfo] = useState<{
    nft?: Nft;
    quantity: number;
  }>({
    quantity: 0,
  });
  const { account } = useEthers();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const webhook = useRef<() => void>();

  const sell = useContractFunction(
    new Contract(Contracts[chainId].marketplace, abis.marketplace),
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

        webhook.current?.();
        webhook.current = undefined;

        break;
    }
  }, [name, quantity, queryClient, sell.state.errorMessage, sell.state.status]);

  return useMemo(() => {
    const send = (
      nft: Nft,
      address: string,
      tokenId: number,
      quantity: number,
      price: BigNumber,
      expires: number
    ) => {
      setInfo({ nft, quantity });
      sell.send(address, tokenId, quantity, price, expires);

      webhook.current = () => {
        const { collection, name, source } = nft;

        callWebhook("list", {
          address,
          collection,
          expires,
          tokenId: nft.tokenId,
          image: source,
          name,
          price: price.toString(),
          quantity,
          user: String(account),
        });
      };
    };

    return { ...sell, send };
  }, [account, sell]);
}

export function useRemoveListing() {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();
  const chainId = useChainId();

  const remove = useContractFunction(
    new Contract(Contracts[chainId].marketplace, abis.marketplace),
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
  const chainId = useChainId();
  const { account } = useEthers();
  const webhook = useRef<() => void>();

  const { send: sendBuy, state } = useContractFunction(
    new Contract(Contracts[chainId].marketplaceBuyer, abis.marketplaceBuyer),
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

        queryClient.invalidateQueries();

        webhook.current?.();
        webhook.current = undefined;

        break;
    }
  }, [queryClient, state.errorMessage, state.status]);

  return useMemo(() => {
    const send = (
      nft: targetNftT,
      address: string,
      ownerAddress: string,
      tokenId: number,
      quantity: number,
      pricePerItem: string
    ) => {
      sendBuy(address, tokenId, ownerAddress, quantity, pricePerItem);

      webhook.current = () => {
        const { metadata, payload } = nft;

        callWebhook("sold", {
          address,
          collection: metadata?.description ?? "",
          image: metadata?.image?.includes("ipfs")
            ? generateIpfsLink(metadata.image)
            : metadata?.image ?? "",
          name: `${metadata?.description ?? ""} ${metadata?.name ?? ""}`,
          tokenId: payload.tokenId,
          price: payload.pricePerItem.toString(),
          quantity,
          user: String(account),
        });
      };
    };

    return { send, state };
  }, [account, sendBuy, state]);
}

export function useUpdateListing() {
  const [{ nft: { name = "" } = {}, quantity }, setInfo] = useState<{
    nft?: Nft;
    quantity: number;
  }>({
    quantity: 0,
  });
  const { account } = useEthers();
  const queryClient = useQueryClient();
  const chainId = useChainId();
  const webhook = useRef<() => void>();

  const update = useContractFunction(
    new Contract(Contracts[chainId].marketplace, abis.marketplace),
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

        webhook.current?.();
        webhook.current = undefined;

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
      nft: Nft,
      address: string,
      tokenId: number,
      quantity: number,
      price: BigNumber,
      expires: number
    ) => {
      setInfo({ nft, quantity });
      update.send(address, tokenId, quantity, price, expires);

      webhook.current = () => {
        const { collection, listing, name, source, tokenId } = nft;

        callWebhook("update", {
          address,
          collection,
          tokenId,
          expires: Number(listing?.expires ?? 0),
          image: source,
          name,
          price: listing?.pricePerItem.toString() ?? "",
          quantity: Number(listing?.quantity ?? 0),
          updates: {
            quantity,
            price: price.toString(),
            expires,
          },
          user: String(account),
        });
      };
    };

    return { ...update, send };
  }, [account, update]);
}

export const useApproveMagic = () => {
  const chainId = useChainId();
  const contract = new Contract(Contracts[chainId].magic, ERC20Interface);
  const { send, state } = useContractFunction(contract, "approve");

  return {
    send: () =>
      send(Contracts[chainId].marketplaceBuyer, MaxUint256.toString()),
    state,
  };
};
