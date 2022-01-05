import { gql } from '@apollo/client'

export const typeDefs = gql`
  type Affiliation {
    id: ID
    pubkey: String
    code: String
  }

  type Transaction {
    id: ID
    pubkey: String
    txid: String
  }

  input AffiliationInput {
    pubkey: String
    code: String
  }

  input TransactionInput {
    pubkey: String
    holdcnt: Int
    txid: String
  }

  type InsertAffiliationPayload {
    affiliation: Affiliation
  }

  type AddTransactionPayload {
    transaction: Transaction
  }

  input CodeInput {
    code: String
  }

  input PubkeyInput {
    pubkey: String
  }

  type GetPubkeyPayload {
    pubkey: String
  }

  type GetCodePayload {
    code: String
  }

  type Mutation {
    insertAffiliation(input: AffiliationInput!): InsertAffiliationPayload
    getPubkey(input: CodeInput!): GetPubkeyPayload
    getCode(input: PubkeyInput!): GetCodePayload
    addTransactionLog(input: TransactionInput!): AddTransactionPayload
  }

  type NFTItem {
    id: Int
    name: String
    image: String
    traits: String
    score: Int
    pos: Int
    hash: String
  }
  
  type Edge {
    cursor: String
    node: NFTItem
  }
  
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean
    traits: String
  }
  
  type Response {
    edges: [Edge]
    pageInfo: PageInfo
  }
  
  type Query {
    getItems(first: Int, filters: [String], after: String, ids: [Int], bottom: Int, top: Int): Response
  }
`;
