import gql from "graphql-tag";

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

export const getUserInventory = gql`
  query getUserInventory($id: ID!) {
    user(id: $id) {
      listings(where: { status: Active, quantity_gt: 0 }) {
        id
        expires
        pricePerItem
        quantity
        token {
          ...TokenFields
        }
      }
      hidden: listings(where: { status: Hidden }) {
        id
        expires
        quantity
        pricePerItem
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
      tokens(first: 1000) {
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

// export const getCollectionInfo = gql`
//   query getCollectionInfo($id: ID!) {
//     collection(id: $id) {
//       id
//       name
//       standard
//       attributes {
//         name
//         percentage
//         value
//       }
//     }
//   }
// `;

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

export const getCollectionStats = gql`
  query getCollectionStats($id: ID!) {
    collection(id: $id) {
      floorPrice
      totalListings
      totalVolume
      listings(where: { status: Active }) {
        token {
          floorPrice
          name
          tokenId
        }
      }
    }
  }
`;

export const getCollections = gql`
  query getCollections {
    collections(orderBy: name) {
      address
      name
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
    $orderBy: Listing_orderBy!
    $isERC1155: Boolean!
    $filter: [String!]
  ) {
    collection(id: $id) {
      name
      address
      standard
      tokens(
        orderBy: floorPrice
        orderDirection: $orderDirection
        where: { name_contains: $tokenName }
      ) @include(if: $isERC1155) {
        id
        name
        tokenId
        listings(where: { status: Active }, orderBy: pricePerItem) {
          pricePerItem
          quantity
        }
        metadata {
          image
          name
          description
        }
      }
      listings(
        first: $first
        skip: $skipBy
        orderBy: $orderBy
        orderDirection: $orderDirection
        where: {
          status: Active
          tokenName_contains: $tokenName
          filters_contains: $filter
        }
      ) @skip(if: $isERC1155) {
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

const LISTING_FRAGMENT = gql`
  fragment ListingFields on Listing {
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
      tokenId
      metadata {
        description
        image
      }
      name
    }
    collection {
      id
    }
    transactionLink
  }
`;

const LISTING_FRAGMENT_WITH_TOKEN = gql`
  fragment ListingFieldsWithToken on Listing {
    user {
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
  query getActivity($id: ID!, $orderBy: Listing_orderBy!) {
    collection(id: $id) {
      listings(
        where: { status: Sold }
        orderBy: $orderBy
        orderDirection: desc
      ) {
        ...ListingFields
      }
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
    $collectionId: ID!
    $tokenId: BigInt!
    $skipBy: Int!
    $first: Int!
  ) {
    collection(id: $collectionId) {
      tokens(where: { tokenId: $tokenId }) {
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
  }
`;

export const getTokenExistsInWallet = gql`
  query getTokenExistsInWallet(
    $collectionId: ID!
    $tokenId: BigInt!
    $address: String!
  ) {
    collection(id: $collectionId) {
      tokens(where: { tokenId: $tokenId }) {
        owners(where: { user: $address }) {
          user {
            id
          }
          quantity
        }
      }
    }
  }
`;

export const getTokenDetails = gql`
  query getTokenDetails($collectionId: ID!, $tokenId: BigInt!) {
    collection(id: $collectionId) {
      name
      standard
      tokens(where: { tokenId: $tokenId }) {
        tokenId
        lowestPrice: listings(
          where: { status: Active }
          first: 1
          orderBy: pricePerItem
          orderDirection: asc
        ) {
          ...ListingFieldsWithToken
        }
        metadata {
          attributes {
            attribute {
              id
              name
              percentage
              value
            }
          }
          description
          id
          image
          name
        }
        listings(orderBy: blockTimestamp, orderDirection: desc) {
          id
          status
          buyer {
            id
          }
          pricePerItem
          user {
            id
          }
          blockTimestamp
        }
        owner {
          id
        }
      }
    }
  }
`;
