import { commonConfig } from "@/config/common"

import type { BillingAccount } from "./interfaces"

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