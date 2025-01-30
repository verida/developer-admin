import { commonConfig } from "@/config/common"

import type { BillingAccount, UsageStats } from "./interfaces"
import type { IAccount } from "@verida/types"

const BASE_API = `${commonConfig.DCS_URL}/api/rest/v1`

export async function getAccount(
  sessionToken: string
): Promise<BillingAccount | undefined> {
  try {
    // Make API request to fetch data
    const response = await fetch(`${BASE_API}/app/account`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": sessionToken,
      },
    })

    if (!response.ok) {
      if (response.status == 404) {
        return
      }
      throw new Error(`HTTP error ${response.status}`)
    }

    const result = await response.json()
    return <BillingAccount> result.account
  } catch (error) {
    throw new Error("Error getting Verida records", { cause: error })
  }
}

export async function registerAccount(
    sessionToken: string
  ): Promise<BillingAccount | undefined> {
    try {
      // Make API request to fetch data
      const response = await fetch(`${BASE_API}/app/register`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": sessionToken,
        },
      })
  
      if (!response.ok) {
        if (response.status == 404) {
          return
        }
        throw new Error(`HTTP error ${response.status}`)
      }
  
      return getAccount(sessionToken)
    } catch (error) {
      throw new Error("Error getting Verida records", { cause: error })
    }
  }

export async function submitDeposit(userAccount: IAccount, sessionToken: string, fromAddress: string, amount: string, txnId: string): Promise<void> {
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
                        "X-API-Key": sessionToken
                    }
                })

                if (!response.ok) {
                    const json = await response.json()
                    throw new Error(`${json.error}`)
                  }
              
                } catch (error: any) {
                    console.log(error)
                  throw new Error(error.message)
                }
}

export async function getVdaPrice(sessionToken: string): Promise<number> {
    const response = await fetch(`${BASE_API}/app/vda-price`, {
        method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": sessionToken
            }
    })

    const json = await response.json()
    console.log(json)
    return <number> json.price
}

export async function connectedAccountCount(sessionToken: string): Promise<number> {
    const response = await fetch(`${BASE_API}/app/account-count`, {
        method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": sessionToken
            }
    })

    const json = await response.json()
    return <number> json.count
}

export async function accountUsage(sessionToken: string): Promise<UsageStats> {
    const response = await fetch(`${BASE_API}/app/usage`, {
        method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": sessionToken
            }
    })

    const json = await response.json()
    return <UsageStats> json.usage
}