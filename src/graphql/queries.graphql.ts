import gql from "graphql-tag";

export const getUserInventory = gql`
  query getUserInventory($id: ID!) {
    user(id: $id) {
      listings {
        id
        expires
        pricePerItem
        quantity
        token {
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
      }
      tokens {
        id
        quantity
        token {
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
      }
    }
  }
`;
