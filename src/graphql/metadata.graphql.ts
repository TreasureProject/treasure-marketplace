import gql from "graphql-tag";

export const getCollectionAttributes = gql`
  query getCollectionAttributes {
    attributes(first: 1000, where: { name_not_contains: "Max" }) {
      id
      name
      percentage
      value
    }
  }
`;

export const getTokenMetadata = gql`
  query getTokenMetadata($ids: [ID!]!) {
    tokens(first: 1000, where: { id_in: $ids }) {
      id
      attributes {
        name
        percentage
        value
      }
      image
      name
      tokenId
    }
  }
`;

export const getFilteredTokens = gql`
  query getFilteredTokens($attributeIds: [ID!]!, $tokenIds: [ID!]!) {
    attributes(where: { id_in: $attributeIds }) {
      id
      tokens(first: 1000, where: { id_in: $tokenIds }) {
        id
      }
    }
  }
`;
