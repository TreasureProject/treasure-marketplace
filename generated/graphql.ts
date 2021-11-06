import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
};

export type Block_Height = {
  hash?: Maybe<Scalars['Bytes']>;
  number?: Maybe<Scalars['Int']>;
};

export type Collection = {
  __typename?: 'Collection';
  address: Scalars['Bytes'];
  id: Scalars['ID'];
  listings: Array<Listing>;
  name: Scalars['String'];
  symbol?: Maybe<Scalars['String']>;
  tokens: Array<Token>;
};


export type CollectionListingsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Listing_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Listing_Filter>;
};


export type CollectionTokensArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Token_Filter>;
};

export type Collection_Filter = {
  address?: Maybe<Scalars['Bytes']>;
  address_contains?: Maybe<Scalars['Bytes']>;
  address_in?: Maybe<Array<Scalars['Bytes']>>;
  address_not?: Maybe<Scalars['Bytes']>;
  address_not_contains?: Maybe<Scalars['Bytes']>;
  address_not_in?: Maybe<Array<Scalars['Bytes']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_lt?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  symbol_contains?: Maybe<Scalars['String']>;
  symbol_ends_with?: Maybe<Scalars['String']>;
  symbol_gt?: Maybe<Scalars['String']>;
  symbol_gte?: Maybe<Scalars['String']>;
  symbol_in?: Maybe<Array<Scalars['String']>>;
  symbol_lt?: Maybe<Scalars['String']>;
  symbol_lte?: Maybe<Scalars['String']>;
  symbol_not?: Maybe<Scalars['String']>;
  symbol_not_contains?: Maybe<Scalars['String']>;
  symbol_not_ends_with?: Maybe<Scalars['String']>;
  symbol_not_in?: Maybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: Maybe<Scalars['String']>;
  symbol_starts_with?: Maybe<Scalars['String']>;
};

export enum Collection_OrderBy {
  Address = 'address',
  Id = 'id',
  Listings = 'listings',
  Name = 'name',
  Symbol = 'symbol',
  Tokens = 'tokens'
}

export type Listing = {
  __typename?: 'Listing';
  collection: Collection;
  expires: Scalars['BigInt'];
  id: Scalars['ID'];
  pricePerItem: Scalars['BigInt'];
  quantity: Scalars['BigInt'];
  status: Status;
  token: Token;
  user: User;
};

export type Listing_Filter = {
  collection?: Maybe<Scalars['String']>;
  collection_contains?: Maybe<Scalars['String']>;
  collection_ends_with?: Maybe<Scalars['String']>;
  collection_gt?: Maybe<Scalars['String']>;
  collection_gte?: Maybe<Scalars['String']>;
  collection_in?: Maybe<Array<Scalars['String']>>;
  collection_lt?: Maybe<Scalars['String']>;
  collection_lte?: Maybe<Scalars['String']>;
  collection_not?: Maybe<Scalars['String']>;
  collection_not_contains?: Maybe<Scalars['String']>;
  collection_not_ends_with?: Maybe<Scalars['String']>;
  collection_not_in?: Maybe<Array<Scalars['String']>>;
  collection_not_starts_with?: Maybe<Scalars['String']>;
  collection_starts_with?: Maybe<Scalars['String']>;
  expires?: Maybe<Scalars['BigInt']>;
  expires_gt?: Maybe<Scalars['BigInt']>;
  expires_gte?: Maybe<Scalars['BigInt']>;
  expires_in?: Maybe<Array<Scalars['BigInt']>>;
  expires_lt?: Maybe<Scalars['BigInt']>;
  expires_lte?: Maybe<Scalars['BigInt']>;
  expires_not?: Maybe<Scalars['BigInt']>;
  expires_not_in?: Maybe<Array<Scalars['BigInt']>>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  pricePerItem?: Maybe<Scalars['BigInt']>;
  pricePerItem_gt?: Maybe<Scalars['BigInt']>;
  pricePerItem_gte?: Maybe<Scalars['BigInt']>;
  pricePerItem_in?: Maybe<Array<Scalars['BigInt']>>;
  pricePerItem_lt?: Maybe<Scalars['BigInt']>;
  pricePerItem_lte?: Maybe<Scalars['BigInt']>;
  pricePerItem_not?: Maybe<Scalars['BigInt']>;
  pricePerItem_not_in?: Maybe<Array<Scalars['BigInt']>>;
  quantity?: Maybe<Scalars['BigInt']>;
  quantity_gt?: Maybe<Scalars['BigInt']>;
  quantity_gte?: Maybe<Scalars['BigInt']>;
  quantity_in?: Maybe<Array<Scalars['BigInt']>>;
  quantity_lt?: Maybe<Scalars['BigInt']>;
  quantity_lte?: Maybe<Scalars['BigInt']>;
  quantity_not?: Maybe<Scalars['BigInt']>;
  quantity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  status?: Maybe<Status>;
  status_in?: Maybe<Array<Status>>;
  status_not?: Maybe<Status>;
  status_not_in?: Maybe<Array<Status>>;
  token?: Maybe<Scalars['String']>;
  token_contains?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_lt?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  user_contains?: Maybe<Scalars['String']>;
  user_ends_with?: Maybe<Scalars['String']>;
  user_gt?: Maybe<Scalars['String']>;
  user_gte?: Maybe<Scalars['String']>;
  user_in?: Maybe<Array<Scalars['String']>>;
  user_lt?: Maybe<Scalars['String']>;
  user_lte?: Maybe<Scalars['String']>;
  user_not?: Maybe<Scalars['String']>;
  user_not_contains?: Maybe<Scalars['String']>;
  user_not_ends_with?: Maybe<Scalars['String']>;
  user_not_in?: Maybe<Array<Scalars['String']>>;
  user_not_starts_with?: Maybe<Scalars['String']>;
  user_starts_with?: Maybe<Scalars['String']>;
};

export enum Listing_OrderBy {
  Collection = 'collection',
  Expires = 'expires',
  Id = 'id',
  PricePerItem = 'pricePerItem',
  Quantity = 'quantity',
  Status = 'status',
  Token = 'token',
  User = 'user'
}

export type Metadata = {
  __typename?: 'Metadata';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type Metadata_Filter = {
  description?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_gt?: Maybe<Scalars['String']>;
  description_gte?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Scalars['String']>>;
  description_lt?: Maybe<Scalars['String']>;
  description_lte?: Maybe<Scalars['String']>;
  description_not?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_not_in?: Maybe<Array<Scalars['String']>>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  image?: Maybe<Scalars['String']>;
  image_contains?: Maybe<Scalars['String']>;
  image_ends_with?: Maybe<Scalars['String']>;
  image_gt?: Maybe<Scalars['String']>;
  image_gte?: Maybe<Scalars['String']>;
  image_in?: Maybe<Array<Scalars['String']>>;
  image_lt?: Maybe<Scalars['String']>;
  image_lte?: Maybe<Scalars['String']>;
  image_not?: Maybe<Scalars['String']>;
  image_not_contains?: Maybe<Scalars['String']>;
  image_not_ends_with?: Maybe<Scalars['String']>;
  image_not_in?: Maybe<Array<Scalars['String']>>;
  image_not_starts_with?: Maybe<Scalars['String']>;
  image_starts_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_lt?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
};

export enum Metadata_OrderBy {
  Description = 'description',
  Id = 'id',
  Image = 'image',
  Name = 'name'
}

export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  collection?: Maybe<Collection>;
  collections: Array<Collection>;
  listing?: Maybe<Listing>;
  listings: Array<Listing>;
  metadata: Array<Metadata>;
  token?: Maybe<Token>;
  tokenSearch: Array<Token>;
  tokens: Array<Token>;
  user?: Maybe<User>;
  userToken?: Maybe<UserToken>;
  userTokens: Array<UserToken>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: Maybe<Block_Height>;
};


export type QueryCollectionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCollectionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collection_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Collection_Filter>;
};


export type QueryListingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryListingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Listing_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Listing_Filter>;
};


export type QueryMetadataArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Metadata_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Metadata_Filter>;
};


export type QueryTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTokenSearchArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  text: Scalars['String'];
};


export type QueryTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Token_Filter>;
};


export type QueryUserArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUserTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<UserToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<UserToken_Filter>;
};


export type QueryUsersArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<User_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<User_Filter>;
};

export enum Status {
  Active = 'Active',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Sold = 'Sold',
  Unlisted = 'Unlisted'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  collection?: Maybe<Collection>;
  collections: Array<Collection>;
  listing?: Maybe<Listing>;
  listings: Array<Listing>;
  metadata: Array<Metadata>;
  token?: Maybe<Token>;
  tokens: Array<Token>;
  user?: Maybe<User>;
  userToken?: Maybe<UserToken>;
  userTokens: Array<UserToken>;
  users: Array<User>;
};


export type Subscription_MetaArgs = {
  block?: Maybe<Block_Height>;
};


export type SubscriptionCollectionArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCollectionsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Collection_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Collection_Filter>;
};


export type SubscriptionListingArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionListingsArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Listing_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Listing_Filter>;
};


export type SubscriptionMetadataArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Metadata_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Metadata_Filter>;
};


export type SubscriptionTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Token_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<Token_Filter>;
};


export type SubscriptionUserArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserTokenArgs = {
  block?: Maybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionUserTokensArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<UserToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<UserToken_Filter>;
};


export type SubscriptionUsersArgs = {
  block?: Maybe<Block_Height>;
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<User_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: Maybe<User_Filter>;
};

export type Token = {
  __typename?: 'Token';
  collection: Collection;
  id: Scalars['ID'];
  metadata?: Maybe<Metadata>;
  metadataUri?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  tokenId: Scalars['BigInt'];
};

export type Token_Filter = {
  collection?: Maybe<Scalars['String']>;
  collection_contains?: Maybe<Scalars['String']>;
  collection_ends_with?: Maybe<Scalars['String']>;
  collection_gt?: Maybe<Scalars['String']>;
  collection_gte?: Maybe<Scalars['String']>;
  collection_in?: Maybe<Array<Scalars['String']>>;
  collection_lt?: Maybe<Scalars['String']>;
  collection_lte?: Maybe<Scalars['String']>;
  collection_not?: Maybe<Scalars['String']>;
  collection_not_contains?: Maybe<Scalars['String']>;
  collection_not_ends_with?: Maybe<Scalars['String']>;
  collection_not_in?: Maybe<Array<Scalars['String']>>;
  collection_not_starts_with?: Maybe<Scalars['String']>;
  collection_starts_with?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  metadata?: Maybe<Scalars['String']>;
  metadataUri?: Maybe<Scalars['String']>;
  metadataUri_contains?: Maybe<Scalars['String']>;
  metadataUri_ends_with?: Maybe<Scalars['String']>;
  metadataUri_gt?: Maybe<Scalars['String']>;
  metadataUri_gte?: Maybe<Scalars['String']>;
  metadataUri_in?: Maybe<Array<Scalars['String']>>;
  metadataUri_lt?: Maybe<Scalars['String']>;
  metadataUri_lte?: Maybe<Scalars['String']>;
  metadataUri_not?: Maybe<Scalars['String']>;
  metadataUri_not_contains?: Maybe<Scalars['String']>;
  metadataUri_not_ends_with?: Maybe<Scalars['String']>;
  metadataUri_not_in?: Maybe<Array<Scalars['String']>>;
  metadataUri_not_starts_with?: Maybe<Scalars['String']>;
  metadataUri_starts_with?: Maybe<Scalars['String']>;
  metadata_contains?: Maybe<Scalars['String']>;
  metadata_ends_with?: Maybe<Scalars['String']>;
  metadata_gt?: Maybe<Scalars['String']>;
  metadata_gte?: Maybe<Scalars['String']>;
  metadata_in?: Maybe<Array<Scalars['String']>>;
  metadata_lt?: Maybe<Scalars['String']>;
  metadata_lte?: Maybe<Scalars['String']>;
  metadata_not?: Maybe<Scalars['String']>;
  metadata_not_contains?: Maybe<Scalars['String']>;
  metadata_not_ends_with?: Maybe<Scalars['String']>;
  metadata_not_in?: Maybe<Array<Scalars['String']>>;
  metadata_not_starts_with?: Maybe<Scalars['String']>;
  metadata_starts_with?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_gt?: Maybe<Scalars['String']>;
  name_gte?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Scalars['String']>>;
  name_lt?: Maybe<Scalars['String']>;
  name_lte?: Maybe<Scalars['String']>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Scalars['String']>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['BigInt']>;
  tokenId_gt?: Maybe<Scalars['BigInt']>;
  tokenId_gte?: Maybe<Scalars['BigInt']>;
  tokenId_in?: Maybe<Array<Scalars['BigInt']>>;
  tokenId_lt?: Maybe<Scalars['BigInt']>;
  tokenId_lte?: Maybe<Scalars['BigInt']>;
  tokenId_not?: Maybe<Scalars['BigInt']>;
  tokenId_not_in?: Maybe<Array<Scalars['BigInt']>>;
};

export enum Token_OrderBy {
  Collection = 'collection',
  Id = 'id',
  Metadata = 'metadata',
  MetadataUri = 'metadataUri',
  Name = 'name',
  TokenId = 'tokenId'
}

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  listings: Array<Listing>;
  tokens: Array<UserToken>;
};


export type UserListingsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Listing_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<Listing_Filter>;
};


export type UserTokensArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<UserToken_OrderBy>;
  orderDirection?: Maybe<OrderDirection>;
  skip?: Maybe<Scalars['Int']>;
  where?: Maybe<UserToken_Filter>;
};

export type UserToken = {
  __typename?: 'UserToken';
  id: Scalars['ID'];
  quantity: Scalars['BigInt'];
  token: Token;
  user: User;
};

export type UserToken_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
  quantity?: Maybe<Scalars['BigInt']>;
  quantity_gt?: Maybe<Scalars['BigInt']>;
  quantity_gte?: Maybe<Scalars['BigInt']>;
  quantity_in?: Maybe<Array<Scalars['BigInt']>>;
  quantity_lt?: Maybe<Scalars['BigInt']>;
  quantity_lte?: Maybe<Scalars['BigInt']>;
  quantity_not?: Maybe<Scalars['BigInt']>;
  quantity_not_in?: Maybe<Array<Scalars['BigInt']>>;
  token?: Maybe<Scalars['String']>;
  token_contains?: Maybe<Scalars['String']>;
  token_ends_with?: Maybe<Scalars['String']>;
  token_gt?: Maybe<Scalars['String']>;
  token_gte?: Maybe<Scalars['String']>;
  token_in?: Maybe<Array<Scalars['String']>>;
  token_lt?: Maybe<Scalars['String']>;
  token_lte?: Maybe<Scalars['String']>;
  token_not?: Maybe<Scalars['String']>;
  token_not_contains?: Maybe<Scalars['String']>;
  token_not_ends_with?: Maybe<Scalars['String']>;
  token_not_in?: Maybe<Array<Scalars['String']>>;
  token_not_starts_with?: Maybe<Scalars['String']>;
  token_starts_with?: Maybe<Scalars['String']>;
  user?: Maybe<Scalars['String']>;
  user_contains?: Maybe<Scalars['String']>;
  user_ends_with?: Maybe<Scalars['String']>;
  user_gt?: Maybe<Scalars['String']>;
  user_gte?: Maybe<Scalars['String']>;
  user_in?: Maybe<Array<Scalars['String']>>;
  user_lt?: Maybe<Scalars['String']>;
  user_lte?: Maybe<Scalars['String']>;
  user_not?: Maybe<Scalars['String']>;
  user_not_contains?: Maybe<Scalars['String']>;
  user_not_ends_with?: Maybe<Scalars['String']>;
  user_not_in?: Maybe<Array<Scalars['String']>>;
  user_not_starts_with?: Maybe<Scalars['String']>;
  user_starts_with?: Maybe<Scalars['String']>;
};

export enum UserToken_OrderBy {
  Id = 'id',
  Quantity = 'quantity',
  Token = 'token',
  User = 'user'
}

export type User_Filter = {
  id?: Maybe<Scalars['ID']>;
  id_gt?: Maybe<Scalars['ID']>;
  id_gte?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Scalars['ID']>>;
  id_lt?: Maybe<Scalars['ID']>;
  id_lte?: Maybe<Scalars['ID']>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Scalars['ID']>>;
};

export enum User_OrderBy {
  Id = 'id',
  Listings = 'listings',
  Tokens = 'tokens'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type GetUserTokensQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetUserTokensQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, tokens: Array<{ __typename?: 'UserToken', id: string, quantity: any, token: { __typename?: 'Token', tokenId: any, collection: { __typename?: 'Collection', address: any }, metadata?: { __typename?: 'Metadata', image?: string | null | undefined, name?: string | null | undefined, description?: string | null | undefined } | null | undefined } }> } | null | undefined };

export type GetUserListingsQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type GetUserListingsQuery = { __typename?: 'Query', user?: { __typename?: 'User', listings: Array<{ __typename?: 'Listing', id: string, quantity: any, token: { __typename?: 'Token', tokenId: any, collection: { __typename?: 'Collection', address: any }, metadata?: { __typename?: 'Metadata', image?: string | null | undefined, name?: string | null | undefined, description?: string | null | undefined } | null | undefined } }> } | null | undefined };


export const GetUserTokensDocument = gql`
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
export const GetUserListingsDocument = gql`
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

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    getUserTokens(variables: GetUserTokensQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserTokensQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserTokensQuery>(GetUserTokensDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserTokens');
    },
    getUserListings(variables: GetUserListingsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<GetUserListingsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetUserListingsQuery>(GetUserListingsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'getUserListings');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;