import gql from "graphql-tag";

export const getUserTokens = gql`
  query getUserTokens($id: ID!) {
    user(id: $id) {
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
      id
    }
  }
`;

export const getUserListings = gql`
  query getUserListings($id: ID!) {
    user(id: $id) {
      listings {
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
