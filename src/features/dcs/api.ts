import { commonConfig } from "@/config/common"

import type { BillingAccount, Scope, ScopesResponse, UsageStats } from "./interfaces"
import type { IAccount } from "@verida/types"

const BASE_API = `${commonConfig.DCS_URL}/api/rest/v1`

export async function getAccount(
  authToken: string
): Promise<BillingAccount | undefined> {
  try {
    // Make API request to fetch data
    const response = await fetch(`${BASE_API}/app/account`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return
      }
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    // TODO: Properly validate the response to avoid assertions
    return <BillingAccount> result.account
  } catch (error) {
    throw new Error("Error getting billing account", { cause: error })
  }
}

export async function registerAccount(
    authToken: string
  ): Promise<BillingAccount | undefined> {
    try {
      // Make API request to fetch data
      const response = await fetch(`${BASE_API}/app/register`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        if (response.status == 404) {
          return
        }
        throw new Error(`HTTP error ${response.status}`)
      }

      return getAccount(authToken)
    } catch (error) {
      throw new Error("Error getting Verida records", { cause: error })
    }
  }

export async function submitDeposit(userAccount: IAccount, authToken: string, fromAddress: string, amount: string, txnId: string): Promise<void> {
    const proofMessage = `txn: ${txnId}\nfrom: ${fromAddress}\namount: ${amount}`
            const keyring = await userAccount.keyring('Verida: Vault')
            const signature = await keyring.sign(proofMessage)

            try {
                const response = await fetch(`${BASE_API}/app/deposit-crypto`, {
                    method: "POST",
                    body: JSON.stringify({
                    txnId,
                    fromAddress,
                    amount,
                    signature
                }),
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    }
                })

                if (!response.ok) {
                    const json = await response.json()
                    throw new Error(`${json.error}`)
                  }

                } catch (error: unknown) {
                  const err = error as Error
                  throw new Error(err.message)
                }
}

export async function getVdaPrice(authToken: string): Promise<number> {
    const response = await fetch(`${BASE_API}/app/vda-price`, {
        method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
    })

    const json = await response.json()
    return <number> json.price
}

export async function connectedAccountCount(authToken: string): Promise<number> {
    const response = await fetch(`${BASE_API}/app/account-count`, {
        method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`,
            }
    })

    const json = await response.json()
    return <number> json.count
}

export async function accountUsage(authToken: string): Promise<UsageStats> {
    const response = await fetch(`${BASE_API}/app/usage`, {
        method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${authToken}`,
            }
    })

    const json = await response.json()
    return <UsageStats> json.usage
}

export async function fetchScopes(): Promise<Record<string, Scope>> {
    const response = await fetch(`${BASE_API}/auth/scopes`)
    if (!response.ok) {
    throw new Error("Failed to fetch scopes")
    }

    const scopeResponse = <ScopesResponse> await response.json()
    return scopeResponse.scopes
}

export async function fetchTokenData(authToken: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${BASE_API}/auth/token?tokenId=${encodeURIComponent(authToken)}`)
    if (!response.ok) {
        throw new Error("Failed to fetch token data")
    }

    const result = await response.json()
    return result
  }
