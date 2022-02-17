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
      inactive: listings(where: { status: Inactive }) {
        id
        expires
        quantity
        pricePerItem
        token {
          ...TokenFields
        }
      }
      tokens(first: 1000) {
        id
        quantity
        token {
          ...TokenFields
        }
      }
      staked(first: 1000) {
        id
        quantity
        token {
          ...TokenFields
        }
      }
    }
  }

  fragment TokenFields on Token {
    id
    collection {
      id
      contract
      name
      standard
    }
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
      name
      floorPrice
      totalListings
      totalVolume
      listings(where: { status: Active }) {
        token {
          floorPrice
          tokenId
          name
        }
      }
    }
  }
`;

export const getCollectionListings = gql`
  query getCollectionListings(
    $erc1155Filters: Token_filter
    $erc1155Ordering: Token_orderBy
    $erc721Filters: Listing_filter
    $erc721Ordering: Listing_orderBy
    $isERC1155: Boolean!
    $orderDirection: OrderDirection
    $skip: Int
  ) {
    tokens(
      first: 200 # This is okay as we will pull all the Treasures
      # orderBy: $erc1155Ordering
      orderBy: floorPrice
      orderDirection: $orderDirection
      where: $erc1155Filters
    ) @include(if: $isERC1155) {
      __typename
      id
      floorPrice
      tokenId
      listings(where: { status: Active }, orderBy: pricePerItem) {
        pricePerItem
        quantity
      }
    }
    listings(
      first: 42
      orderBy: $erc721Ordering
      orderDirection: $orderDirection
      skip: $skip
      where: $erc721Filters
    ) @skip(if: $isERC1155) {
      __typename
      seller {
        id
      }
      expires
      id
      pricePerItem
      token {
        id
        tokenId
        name
      }
      quantity
    }
  }
`;

export const getTokensByName = gql`
  query getTokensByName($name: String!, $ids: [ID!]!) {
    tokens(first: 1000, where: { name_contains: $name, id_in: $ids }) {
      id
    }
  }
`;

const LISTING_FRAGMENT = gql`
  fragment ListingFields on Listing {
    blockTimestamp
    buyer {
      id
    }
    id
    pricePerItem
    quantity
    seller {
      id
    }
    token {
      id
      tokenId
    }
    collection {
      id
    }
    transactionLink
  }
`;

const LISTING_FRAGMENT_WITH_TOKEN = gql`
  fragment ListingFieldsWithToken on Listing {
    seller {
      id
    }
    expires
    id
    pricePerItem
    quantity
  }
`;

export const getActivity = gql`
  ${LISTING_FRAGMENT}
  query getActivity($id: String!, $orderBy: Listing_orderBy!) {
    listings(
      where: { status: Sold, collection: $id }
      orderBy: $orderBy
      orderDirection: desc
    ) {
      ...ListingFields
    }
  }
`;

export const getMyActivity = gql`
  ${LISTING_FRAGMENT}
  query getMyActivity($me: String) {
    sold: listings(where: { status: Sold, seller: $me }) {
      ...ListingFields
    }
    bought: listings(where: { status: Sold, buyer: $me }) {
      ...ListingFields
    }
  }
`;

export const getAllActivities = gql`
  ${LISTING_FRAGMENT}
  query getAllActivities($orderBy: Listing_orderBy!) {
    listings(where: { status: Sold }, orderBy: $orderBy, orderDirection: desc) {
      ...ListingFields
    }
  }
`;

export const getERC1155Listings = gql`
  ${LISTING_FRAGMENT_WITH_TOKEN}
  query getERC1155Listings(
    $collectionId: String!
    $tokenId: BigInt!
    $skipBy: Int!
    $first: Int!
  ) {
    tokens(where: { collection: $collectionId, tokenId: $tokenId }) {
      tokenId
      listings(
        where: { status: Active }
        skip: $skipBy
        first: $first
        orderBy: pricePerItem
        orderDirection: asc
      ) {
        ...ListingFieldsWithToken
      }
    }
  }
`;

export const getTokenExistsInWallet = gql`
  query getTokenExistsInWallet(
    $collectionId: String!
    $tokenId: BigInt!
    $address: String!
  ) {
    tokens(where: { collection: $collectionId, tokenId: $tokenId }) {
      owners(where: { user: $address }) {
        user {
          id
        }
        quantity
      }
    }
  }
`;

export const getCollections = gql`
  query getCollections {
    collections(orderBy: name, where: { name_not: "Legions" }) {
      contract
      name
    }
  }
`;

export const getTokenDetails = gql`
  query getTokenDetails($collectionId: ID!, $tokenId: BigInt!) {
    collection(id: $collectionId) {
      name
      standard
      tokens(where: { tokenId: $tokenId }) {
        id
        tokenId
        lowestPrice: listings(
          where: { status: Active }
          first: 1
          orderBy: pricePerItem
          orderDirection: asc
        ) {
          ...ListingFieldsWithToken
        }
        listings(orderBy: blockTimestamp, orderDirection: desc) {
          id
          status
          buyer {
            id
          }
          pricePerItem
          seller {
            id
          }
          blockTimestamp
        }
        owners {
          user {
            id
          }
        }
      }
    }
  }
`;

export const getCollectionsListedTokens = gql`
  query getCollectionsListedTokens($collection: String!) {
    listings(
      first: 1000
      where: { collection: $collection, status: Active }
      orderBy: id
    ) {
      token {
        id
      }
    }
  }
`;

export const getFloorPrice = gql`
  query getFloorPrice($collection: ID!, $tokenId: BigInt!) {
    collection(id: $collection) {
      floorPrice
      standard
      tokens(where: { tokenId: $tokenId }) {
        floorPrice
      }
    }
  }
`;
