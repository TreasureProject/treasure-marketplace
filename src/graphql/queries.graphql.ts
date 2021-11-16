import gql from "graphql-tag";

export const getUserInventory = gql`
  query getUserInventory($id: ID!) {
    user(id: $id) {
      listings(where: { status: Active }) {
        id
        expires
        pricePerItem
        quantity
        token {
          ...TokenFields
        }
      }
      sold: listings(where: { status: Sold }) {
        id
        quantity
        pricePerItem
        token {
          ...TokenFields
        }
      }
      tokens {
        id
        quantity
        token {
          ...TokenFields
        }
      }
    }
  }

  fragment TokenFields on Token {
    collection {
      address
      name
      standard
    }
    metadata {
      image
      name
      description
    }
    name
    tokenId
  }
`;

export const getCollectionInfo = gql`
  query getCollectionInfo($id: ID!) {
    collection(id: $id) {
      id
      name
      standard
    }
  }
`;

export const getCollectionStats = gql`
  query getCollectionStats($id: ID!) {
    collection(id: $id) {
      floorPrice
      totalListings
      listings(where: { status: Active }) {
        token {
          floorPrice
          name
        }
      }
    }
  }
`;

export const getCollectionListings = gql`
  query getCollectionListings(
    $id: ID!
    $orderDirection: OrderDirection!
    $tokenName: String
    $skipBy: Int!
    $first: Int!
  ) {
    collection(id: $id) {
      name
      address
      listings(
        first: $first
        skip: $skipBy
        orderBy: pricePerItem
        orderDirection: $orderDirection
        where: { status: Active, tokenName_contains: $tokenName }
      ) {
        user {
          id
        }
        expires
        id
        pricePerItem
        token {
          tokenId
          metadata {
            image
            name
            description
          }
          name
        }
        quantity
      }
    }
  }
`;

export const getActivity = gql`
  query getActivity($orderBy: Listing_orderBy!) {
    listings(
      where: { status: Sold }
      orderBy: $orderBy 
      orderDirection: desc
    ) {
      blockTimestamp
      buyer {
        id
      }
      id
      pricePerItem
      quantity
      seller: user {
        id
      }
      token {
        metadata {
          description
          image
        }
        name
      }
      transactionLink
    }
  }
`;
