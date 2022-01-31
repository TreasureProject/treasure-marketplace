import { GraphQLClient } from "graphql-request";
import { getSdk as getBridgeworldSdk } from "../../generated/bridgeworld.graphql";
import { getSdk as getMarketplaceSdk } from "../../generated/marketplace.graphql";
import { getSdk as getQueriesSdk } from "../../generated/queries.graphql";

export const bridgeworld = getBridgeworldSdk(
  new GraphQLClient(`${process.env.NEXT_PUBLIC_BRIDGEWORLD_SUBGRAPH}`)
);

export const client = getQueriesSdk(
  new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_URL as string)
);

export const marketplace = getMarketplaceSdk(
  new GraphQLClient(`${process.env.NEXT_PUBLIC_MARKETPLACE_SUBGRAPH}`)
);

export default client;
