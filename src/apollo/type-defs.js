import { gql } from '@apollo/client'

export const typeDefs = gql`
  type Affiliation {
    id: ID
    pubkey: String
    code: String
  }

  input AffiliationInput {
    pubkey: String
    code: String
  }

  type InsertAffiliationPayload {
    affiliation: Affiliation
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
  }
`
