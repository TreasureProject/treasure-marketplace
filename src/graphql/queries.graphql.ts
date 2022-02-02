import gql from "graphql-tag";

export const getCollectionAttributes = gql`
  query getCollectionAttributes($id: ID!) {
    collection(id: $id) {
      attributes {
        name
        percentage
        value
      }
    }
  }
`;

export const getCollectionMetadata = gql`
  query getCollectionMetadata(
    $id: String!
    $tokenId_in: [BigInt!]!
    $isERC1155: Boolean!
  ) {
    erc721: tokens(
      first: 1000
      where: { collection: $id, tokenId_in: $tokenId_in }
    ) @skip(if: $isERC1155) {
      metadata {
        image
        name
        description
      }
      name
      tokenId
    }
    erc1155: tokens(first: 1000, where: { collection: $id })
      @include(if: $isERC1155) {
      metadata {
        image
        name
        description
      }
      name
      tokenId
    }
  }
`;

export const getTokenMetadata = gql`
  query getTokenMetadata($id: ID!) {
    token(id: $id) {
      metadata {
        attributes {
          attribute {
            id
            name
            percentage
            value
          }
        }
        image
        name
        description
      }
      name
      tokenId
    }
  }
`;

export const getFilteredTokens = gql`
  query getFilteredTokens($filters: [String!]!) {
    tokens(first: 1000, where: { filters_contains: $filters }) {
      id
    }
  }
`;

export const getTokensMetadata = gql`
  query getTokensMetadata($ids: [ID!]!) {
    tokens(
      first: 1000
      where: {
        collection_not: "0xfe8c1ac365ba6780aec5a985d989b327c27670a1"
        id_in: $ids
      }
    ) {
      id
      metadata {
        image
        name
        description
      }
      name
      tokenId
    }
  }
`;
