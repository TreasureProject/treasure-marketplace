import type { Nft, targetNftT } from "../types";

import * as abis from "./abis";
import {
  ChainId,
  ERC20Interface,
  useContractCalls,
  useContractFunction,
  useEthers as useDappEthers,
} from "@usedapp/core";
import { BigNumber, Contract } from "ethers";
import {
  BATTLEFLY_METADATA,
  BridgeworldItems,
  Contracts,
  smolverseItems,
} from "../const";
import { Interface } from "@ethersproject/abi";
import { generateIpfsLink } from "../utils";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { MaxUint256 } from "@ethersproject/constants";
import plur from "plur";
import { TokenStandard } from "../../generated/queries.graphql";
import { bridgeworld, client, marketplace, smolverse } from "./client";
import { AddressZero } from "@ethersproject/constants";
import { normalizeBridgeworldTokenMetadata } from "../utils/metadata";

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

/**
 * Create a wrapper function so we can override account information in one place if needed.
 */
export function useEthers() {
  const data = useDappEthers();

  return data;
}

export function useChainId() {
  const { chainId } = useEthers();

  switch (chainId) {
    case ChainId.Arbitrum:
    case ChainId.ArbitrumRinkeby:
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

type Collection = Record<"address" | "id" | "name" | "slug", string>;

export function useCollections(): Collection[] {
  const { data } = useQuery(
    ["collections"],
    () => marketplace.getCollections(),
    { refetchInterval: 60_000 }
  );

  return (
    data?.collections.map((item) => ({
      address: item.contract,
      id: item.id,
      name: item.name,
      slug: item.name.replace(/\s+/g, "-")?.toLowerCase(),
    })) ?? []
  );
}

export function useCollection(input?: string | string[]) {
  const collections = useCollections();
  const slugOrAddress =
    (Array.isArray(input) ? input[0]?.toLowerCase() : input?.toLowerCase()) ??
    AddressZero;

  const collection = collections.find(({ address, slug }) =>
    [address, slug].includes(slugOrAddress)
  ) ?? { id: "", address: AddressZero, name: "", slug: "" };

  return collection;
}

export function useCollectionNameFromAddress(
  tokenAddress: string
): string | undefined {
  const collections = useCollections();

  return collections.find(({ address }) => address === tokenAddress)?.name;
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
      sell.send(address, tokenId, quantity, price, Math.round(expires / 1000));

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
      update.send(
        address,
        tokenId,
        quantity,
        price,
        Math.round(expires / 1000)
      );

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

type Metadata = {
  id: string;
  description?: string;
  image?: string | null;
  name: string;
  tokenId?: string | number;
  attributes?: Array<{
    attribute: {
      name: string;
      value: string;
    };
  }> | null;
};

const normalizeAttributes = (data) => ({
  ...data,
  attributes: data.attributes.map(({ attribute, trait_type: name, value }) => ({
    attribute: attribute ?? { name, value },
  })),
});

function useBattleflyApi(key: "bf" | "founders", input: string[]) {
  const slug = key === "bf" ? "battleflies" : "specials";

  const initialData = useCallback(() => {
    if (input.length === 0) {
      return undefined;
    }

    const data = normalizeAttributes(BATTLEFLY_METADATA[slug]);

    return input.map((id) => ({ id, ...data }));
  }, [input, slug]);

  return useQuery<Metadata[]>(
    [`${key}-metadata`, input],
    () =>
      fetch(
        `${process.env.NEXT_PUBLIC_BATTLEFLY_API}/${slug}/metadata?ids=${input
          .map((tokenId) => parseInt(tokenId.slice(45), 16))
          .join(",")}`
      ).then((res) => res.json()),
    {
      enabled: input.length > 0,
      refetchInterval: false,
      keepPreviousData: true,
      initialData,
      select: useCallback(
        (values: Metadata[]) =>
          values.map((value) => {
            const data = normalizeAttributes(value);

            return {
              ...data,
              id: input.find((item) =>
                item.endsWith(`-0x${value.tokenId?.toString(16)}`)
              ),
              name: [
                data.attributes.find(
                  ({ attribute }) => attribute.name === "Edition"
                )?.attribute.value,
                value.name,
              ].join(" "),
            };
          }),
        [input]
      ),
    }
  );
}

export function useBattleflyMetadata(input: string[]) {
  return useBattleflyApi("bf", input);
}

export function useFoundersMetadata(input: string[]) {
  return useBattleflyApi("founders", input);
}

export function useMetadata(
  collectionName: string,
  { id = "", ids = [] }: Partial<{ id: string; ids: string[] }>
) {
  const isBridgeworldItem = BridgeworldItems.includes(collectionName);
  const isSmolverseItem = smolverseItems.includes(collectionName);
  const isBattleflyItem = collectionName === "BattleFly";
  const isFoundersItem = collectionName.includes("Founders");
  const isTreasureItem = collectionName === "Treasures";

  const legacyMetadataResult = useQuery(
    ["metadata", ids],
    () => client.getCollectionMetadata({ ids }),
    {
      enabled:
        !!ids &&
        !isBridgeworldItem &&
        !isSmolverseItem &&
        !isBattleflyItem &&
        !isFoundersItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const tokenMetadataResult = useQuery(
    ["details-metadata", id],
    () => client.getTokenMetadata({ id }),
    {
      enabled:
        !!id &&
        !isBridgeworldItem &&
        !isTreasureItem &&
        !isSmolverseItem &&
        !isBattleflyItem &&
        !isFoundersItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const bridgeworldMetadataResult = useQuery(
    ["bw-metadata", ids],
    () => bridgeworld.getBridgeworldMetadata({ ids }),
    {
      enabled: !!ids && (isBridgeworldItem || isTreasureItem),
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const smolverseMetadataResult = useQuery(
    ["sv-metadata", ids],
    () => smolverse.getSmolverseMetadata({ ids }),
    {
      enabled: !!ids && isSmolverseItem,
      refetchInterval: false,
      keepPreviousData: true,
    }
  );

  const battleflyMetadataResult = useBattleflyMetadata(
    isBattleflyItem && id ? [id] : []
  );

  const foundersMetadataResult = useFoundersMetadata(
    isFoundersItem && id ? [id] : []
  );

  const data = {
    battlefly: battleflyMetadataResult.data?.[0],
    bridgeworld: bridgeworldMetadataResult.data,
    legacy: legacyMetadataResult.data,
    founders: foundersMetadataResult.data?.[0],
    smolverse: smolverseMetadataResult.data,
    token: tokenMetadataResult.data,
  };

  const getMetadata = useCallback(
    (
      battleflyMetadata?: Metadata,
      bridgeworldMetadata?: Metadata,
      foundersMetadata?: Metadata,
      legacyMetadata?: Metadata,
      smolverseMetadata?: Metadata,
      tokenMetadata?: Metadata
    ) => {
      const metadata = bridgeworldMetadata
        ? normalizeBridgeworldTokenMetadata(bridgeworldMetadata as any)
        : smolverseMetadata
        ? {
            id: smolverseMetadata.id,
            description: collectionName,
            image: smolverseMetadata.image,
            name: smolverseMetadata.name,
          }
        : tokenMetadata ??
          legacyMetadata ??
          foundersMetadata ??
          battleflyMetadata ??
          null;

      return metadata;
    },
    [collectionName]
  );

  const allMetadataLoaded =
    isBridgeworldItem || isTreasureItem
      ? !bridgeworldMetadataResult.isLoading && !!bridgeworldMetadataResult.data
      : isSmolverseItem
      ? !smolverseMetadataResult.isLoading && !!smolverseMetadataResult.data
      : isBattleflyItem
      ? !battleflyMetadataResult.isLoading && !!battleflyMetadataResult.data
      : isFoundersItem
      ? !foundersMetadataResult.isLoading && !!foundersMetadataResult.data
      : !legacyMetadataResult.isLoading && !!legacyMetadataResult.data && !!id
      ? !tokenMetadataResult.isLoading && !!tokenMetadataResult.data
      : true;

  return { allMetadataLoaded, data, getMetadata };
}
