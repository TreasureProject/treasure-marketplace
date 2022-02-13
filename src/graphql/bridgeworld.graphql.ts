import gql from "graphql-tag";

export const getBridgeworldMetadata = gql`
  query getBridgeworldMetadata($ids: [ID!]!) {
    tokens(first: 1000, where: { id_in: $ids }) {
      id
      image
      name
      tokenId
      metadata {
        __typename
        ... on LegionInfo {
          boost
          cooldown
          crafting
          questing
          summons
          rarity
          role
          type
          summons
        }
        ... on ConsumableInfo {
          id
          type
          size
        }
        ... on TreasureInfo {
          id
          boost
          category
          tier
        }
      }
    }
  }
`;

export const getFilteredLegions = gql`
  query getFilteredLegions($filters: LegionInfo_filter!) {
    legionInfos(first: 1000, where: $filters) {
      id
    }
  }
`;

export const getFilteredTreasures = gql`
  query getFilteredTreasures($filters: TreasureInfo_filter!) {
    treasureInfos(first: 200, where: $filters) {
      id
    }
  }
`;
export const getTreasureBoosts = gql`
  query getTreasureBoosts {
    treasureInfos(first: 200, orderBy: boost) {
      boost
    }
  }
`;
