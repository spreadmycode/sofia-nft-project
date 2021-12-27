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

  type Query {
    affiliation(id: ID!): Affiliation
    affiliations: [Affiliation]
    viewer: Affiliation
  }

  type Mutation {
    insertAffiliation(input: AffiliationInput!): InsertAffiliationPayload
    getPubkey(input: CodeInput!): GetPubkeyPayload
    getCode(input: PubkeyInput!): GetCodePayload
    addTransactionLog(input: TransactionInput!): AddTransactionPayload
  }
`
