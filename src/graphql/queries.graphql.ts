import gql from "graphql-tag";

export const getUserTokens = gql`
  query getUserTokens($id: ID!) {
    user(id: $id) {
      listings {
        quantity
        token {
          id
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
      id
    }
  }
`;
