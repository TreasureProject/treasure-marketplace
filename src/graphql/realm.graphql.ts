import gql from "graphql-tag";

export const getRealmMetadata = gql`
  query getRealmMetadata($ids: [ID!]!) {
    realms(first: 1000, where: { id_in: $ids }) {
      id
      name
      feature1
      feature2
      feature3
      metrics {
        name
        totalAmount
      }
      totalStructures {
        totalAquariums
        totalCities
        totalFarms
        totalResearchLabs
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

export const getFilteredStructures = gql`
  query getFilteredStructures($filters: TotalStructure_filter!) {
    totalStructures(first: 1000, where: $filters) {
      id
    }
  }
`;
