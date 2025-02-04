export interface BillingAccount {
  did: string
  tokens: BillingTokens
  insertedAt?: string
}

export enum BillingTxnType {
  FREE = "free",
  CRYPTO = "crypto",
  FIAT = "fiat",
}

export interface BillingTokens {
  free: string
  owned: string
}

export interface UsageStats {
  connectedAccounts: number
  requests: number
  resultSize: number
}

export enum ScopeType {
  DATASTORE = "ds",
  DATABASE = "db",
  API = "api",
}

export interface Scope {
  type: ScopeType
  description: string
  userNote?: string
  credits?: number
}

export interface ScopesResponse {
  scopes: Record<string, Scope>
}
