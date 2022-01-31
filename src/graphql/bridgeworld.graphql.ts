import gql from "graphql-tag";

export const getLegionMetadata = gql`
  query getLegionMetadata($ids: [ID!]!) {
    tokens(where: { id_in: $ids }) {
      id
      image
      name
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
      }
    }
  }
`;
