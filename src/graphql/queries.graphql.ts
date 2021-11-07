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
    }
    metadata {
      image
      name
      description
    }
    tokenId
  }
`;
