import gql from "graphql-tag";

export const getRealmMetadata = gql`
  query getRealmMetadata($ids: [ID!]!) {
    realms(first: 1000, where: { id_in: $ids }) {
      id
      feature1
      feature2
      feature3
      structures {
        magicRefinery {
          tier
        }
        staked
        type
      }
      terraformedAt
      totalNaturalResources {
        ancientArtifacts
        aquaticResources
        landAbundance
        mineralDeposit
        total
      }
    }
  }
`;

export const getFilteredFeatures = gql`
  query getFilteredFeatures($ids: [ID!]!, $feature: [String!]) {
    feature1: realms(
      first: 1000
      where: { id_in: $ids, feature1_in: $feature }
    ) {
      id
    }
    feature2: realms(
      first: 1000
      where: { id_in: $ids, feature2_in: $feature }
    ) {
      id
    }
    feature3: realms(
      first: 1000
      where: { id_in: $ids, feature3_in: $feature }
    ) {
      id
    }
  }
`;

export const getFilteredMagicRefineries = gql`
  query getFilteredMagicRefineries($filters: MagicRefinery_filter!) {
    magicRefineries(first: 1000, where: $filters) {
      realm {
        id
      }
    }
  }
`;

export const getFilteredNaturalResources = gql`
  query getFilteredNaturalResources($filters: TotalNaturalResource_filter!) {
    totalNaturalResources(first: 1000, where: $filters) {
      id
    }
  }
`;

export const getFilteredStructures = gql`
  query getFilteredStructures($filters: Structure_filter!) {
    structures(first: 1000, where: $filters) {
      realm {
        id
      }
    }
  }
`;
