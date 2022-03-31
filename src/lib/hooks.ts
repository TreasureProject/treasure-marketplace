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
  METADATA_COLLECTIONS,
  smolverseItems,
} from "../const";
import { Interface } from "@ethersproject/abi";
import { generateIpfsLink } from "../utils";
import { toast } from "react-hot-toast";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "react-query";
import { MaxUint256 } from "@ethersproject/constants";
import plur from "plur";
import { TokenStandard } from "../../generated/queries.graphql";
import {
  bridgeworld,
  client,
  marketplace,
  metadata,
  realm,
  smolverse,
} from "./client";
import { AddressZero } from "@ethersproject/constants";
import { normalizeBridgeworldTokenMetadata } from "../utils/metadata";

type WebhookBody = {
  collection: string;
  expires?: number;
  image: string;
  slug: string;
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
        const { collection, name, source, slug } = nft;

        callWebhook("list", {
          slug,
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
    new Contract(Contracts[chainId].marketplace, abis.marketplace),
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
        const { metadata, payload, slug, collection } = nft;

        callWebhook("sold", {
          slug,
          collection,
          image: metadata?.image?.includes("ipfs")
            ? generateIpfsLink(metadata.image)
            : metadata?.image ?? "",
          name: metadata?.name ?? "",
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
        const { collection, listing, slug, name, source, tokenId } = nft;

        callWebhook("update", {
          slug,
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
    send: () => send(Contracts[chainId].marketplace, MaxUint256.toString()),
    state,
  };
};

type Metadata = {
  id: string;
  description?: string;
  image?: string | null;
  name: string;
  tokenId?: string | number;
  attributes?: Array<
    | {
        attribute: {
          name: string;
          value: string;
        };
      }
    | {
        name: string;
        percentage?: string | null;
        value: string;
      }
  > | null;
};

const REALM_METRIC_NAMES = ["Gold", "Food", "Culture", "Technology"];
const REALM_EMPTY_METRICS = REALM_METRIC_NAMES.map((name) => ({
  name,
  totalAmount: "0",
}));

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
              name:
                value.name === "Cocoon"
                  ? [
                      data.attributes.find(
                        ({ attribute }) => attribute.name === "Edition"
                      )?.attribute.value,
                      value.name,
                    ]
                      .filter(Boolean)
                      .join(" ")
                  : value.name,
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

export function useSmithoniaWeaponsMetadata(input: string[]) {
  return useQueries(
    input.map((tokenId) => ({
      queryKey: ["smithonia-weapons-metadata", tokenId],
      queryFn: () =>
        fetch(
          `${process.env.NEXT_PUBLIC_SMITHONIA_WEAPONS_API}/${parseInt(
            tokenId.slice(45),
            16
          )}`
        ).then((res) => res.json()),
      enabled: tokenId.length > 0,
      refetchInterval: false as const,
      keepPreviousData: true,
      // initialData,
      select: (value: Metadata) => [
        {
          ...value,
          id:
            input.find((item) =>
              item.endsWith(
                `-0x${parseInt(
                  value.name.replace("Smithonia Weapon #", ""),
                  16
                )}`
              )
            ) ?? "",
        },
      ],
    }))
  ).reduce<{ data: Metadata[]; isLoading: boolean }>(
    (acc, query) => {
      if (query.data) {
        acc.data.push(...query.data);
      }

      acc.isLoading = query.isLoading;

      return acc;
    },
    { data: [], isLoading: false }
  );
}

type Attribute = Awaited<
  ReturnType<typeof metadata.getTokenMetadata>
>["tokens"][number]["attributes"][number];

function formatCurrentMaxAttribute([current, max]: [Attribute, Attribute]) {
  return {
    ...current,
    value: `${current.value}/${max.value}`,
  };
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
  const isShared = METADATA_COLLECTIONS.includes(collectionName);
  const isRealm = collectionName === "Realm";
  const isSmithonia = (collectionName = "Smithonia Weapons");
  const collection = useCollection(collectionName);

  const legacyMetadataResult = useQuery(
    ["metadata", ids],
    () => client.getCollectionMetadata({ ids }),
    {
      enabled:
        !!ids &&
        !isBridgeworldItem &&
        !isSmolverseItem &&
        !isBattleflyItem &&
        !isFoundersItem &&
        !isShared &&
        !isRealm &&
        !isSmithonia,
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
        !isFoundersItem &&
        !isShared &&
        !isRealm &&
        !isSmithonia,
      refetchInterval: false,
      keepPreviousData: true,
      select: ({ token }) => {
        const metadata = token?.metadata;

        return {
          token: { ...token, metadata: { ...metadata, name: token?.name } },
        };
      },
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

  const sharedMetadataResult = useQuery(
    ["shared-metadata", ids],
    () => metadata.getTokenMetadata({ ids }),
    {
      enabled: !!ids && isShared,
      refetchInterval: false,
      keepPreviousData: true,
      select: (data) => {
        switch (collectionName) {
          case "Tales of Elleria": {
            return {
              tokens: data.tokens.map((token) => {
                const attributes = token.attributes.reduce((acc, attribute) => {
                  acc[attribute.name.replace(/ /g, "")] = attribute;

                  return acc;
                }, {} as Record<string, Attribute>);

                return {
                  ...token,
                  attributes: [
                    attributes.Class,
                    attributes.Rarity,
                    attributes.Level,
                    ...[
                      [attributes.Strength, attributes.MaxStrength],
                      [attributes.Agility, attributes.MaxAgility],
                      [attributes.Vitality, attributes.MaxVitality],
                      [attributes.Endurance, attributes.MaxEndurance],
                      [attributes.Intelligence, attributes.MaxIntelligence],
                      [attributes.Will, attributes.MaxWill],
                      [attributes.TotalStats, attributes.MaxTotalStats],
                    ].map(formatCurrentMaxAttribute),
                  ],
                };
              }),
            };
          }
          default:
            return data;
        }
      },
    }
  );
  const realmMetadataResult = useQuery(
    ["realm-metadata", ids],
    () =>
      realm.getRealmMetadata({
        ids: ids.map((item) => `${parseInt(item.slice(45), 16)}`),
      }),
    {
      enabled: !!ids && isRealm,
      refetchInterval: false,
      keepPreviousData: true,
      select: (data) => {
        return data.realms.map((item) => {
          const {
            feature1,
            feature2,
            feature3,
            metrics,
            totalStructures: [
              {
                totalAquariums = "0",
                totalCities = "0",
                totalFarms = "0",
                totalResearchLabs = "0",
              } = {},
            ],
          } = item;
          const image = "/img/realm.png";
          const name = `Realm #${item.id}`;
          const id = `${collection.address}-0x${parseInt(item.id, 16)}`;
          const attributes = [
            { name: "Feature 1", value: feature1 },
            { name: "Feature 2", value: feature2 },
            { name: "Feature 3", value: feature3 },
            { name: "Aquariums", value: totalAquariums },
            { name: "Cities", value: totalCities },
            { name: "Farms", value: totalFarms },
            { name: "Research Labs", value: totalResearchLabs },
            ...[...metrics, ...REALM_EMPTY_METRICS]
              .filter(
                (metric, index, array) =>
                  array.findIndex((item) => item.name === metric.name) === index
              )
              .filter((metric) => REALM_METRIC_NAMES.includes(metric.name))
              .map(({ name, totalAmount: value }) => ({ name, value })),
          ];

          return { attributes, id, image, name };
        });
      },
    }
  );

  const battleflyMetadataResult = useBattleflyMetadata(
    isBattleflyItem && id ? [id] : []
  );

  const foundersMetadataResult = useFoundersMetadata(
    isFoundersItem && id ? [id] : []
  );

  const smithoniaMetadataResult = useSmithoniaWeaponsMetadata(
    isSmithonia && id ? [id] : []
  );

  const data = {
    battlefly: battleflyMetadataResult.data?.[0],
    bridgeworld: bridgeworldMetadataResult.data,
    legacy: legacyMetadataResult.data,
    founders: foundersMetadataResult.data?.[0],
    realm: realmMetadataResult.data,
    shared: sharedMetadataResult.data,
    smithonia: smithoniaMetadataResult.data?.[0],
    smolverse: smolverseMetadataResult.data,
    token: tokenMetadataResult.data,
  };

  const getMetadata = useCallback(
    (
      battleflyMetadata?: Metadata,
      bridgeworldMetadata?: Metadata,
      foundersMetadata?: Metadata,
      legacyMetadata?: Metadata,
      sharedMetadata?: Metadata,
      realmMetadata?: Metadata,
      smolverseMetadata?: Metadata,
      smithoniaMetadata?: Metadata,
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
            attributes: smolverseMetadata.attributes?.map((attribute) => ({
              attribute,
            })),
          }
        : sharedMetadata
        ? {
            id: sharedMetadata.id,
            description: collectionName,
            image: sharedMetadata.image,
            name: sharedMetadata.name,
            attributes: sharedMetadata.attributes?.map((attribute) => ({
              attribute,
            })),
          }
        : realmMetadata
        ? {
            id: realmMetadata.id,
            description: collectionName,
            image: realmMetadata.image,
            name: realmMetadata.name,
            attributes: realmMetadata.attributes?.map((attribute) => ({
              attribute,
            })),
          }
        : tokenMetadata ??
          legacyMetadata ??
          foundersMetadata ??
          battleflyMetadata ??
          smithoniaMetadata ??
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
      : isShared
      ? !sharedMetadataResult.isLoading && !!sharedMetadataResult.data
      : isRealm
      ? !realmMetadataResult.isLoading && !!realmMetadataResult.data
      : isBattleflyItem
      ? !battleflyMetadataResult.isLoading && !!battleflyMetadataResult.data
      : isFoundersItem
      ? !battleflyMetadataResult.isLoading && !!battleflyMetadataResult.data
      : isSmithonia
      ? !smithoniaMetadataResult.isLoading && !!smithoniaMetadataResult.data
      : !legacyMetadataResult.isLoading && !!legacyMetadataResult.data && !!id
      ? !tokenMetadataResult.isLoading && !!tokenMetadataResult.data
      : true;

  return { allMetadataLoaded, data, getMetadata };
}
