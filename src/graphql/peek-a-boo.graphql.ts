import gql from "graphql-tag";

export const getPeekABooAttributes = gql`
  query getPeekABooAttributes {
    attributes(first: 1000) {
      name
      percentage
      value
    }
  }
`;

export const getPeekABooMetadata = gql`
  query getPeekABooMetadata($ids: [ID!]!) {
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

export const getFilteredPeekABoos = gql`
  query getFilteredPeekABoos($attributeIds: [ID!]!) {
    attributes(where: { id_in: $attributeIds }) {
      id
      tokens {
        id
      }
    }
  }
`;
