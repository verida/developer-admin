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
