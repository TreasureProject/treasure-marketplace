import gql from "graphql-tag";

export const getCollectionAttributes = gql`
  query getCollectionAttributes($collection: String!) {
    attributes(
      first: 1000
      where: { collection: $collection, name_not_contains: "Max" }
    ) {
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
  query getFilteredTokens($filter: Attribute_filter!, $tokenIds: [ID!]!) {
    attributes(where: $filter) {
      id
      tokens(first: 1000, where: { id_in: $tokenIds }) {
        id
      }
    }
  }
`;
