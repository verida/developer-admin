import { getVdaPrice } from "./api"
import type { BillingAccount } from "./interfaces"

export function tokensToNumber(tokens: string): number {
  // Convert to BigInt, then to float by dividing by 1e18
  const tokensBigInt = BigInt(tokens.toString())
  // Potential precision loss for very large amounts
  return Number(tokensBigInt) / 1e18
}

export function accountBalance(account: BillingAccount): number {
  return (
    tokensToNumber(account.tokens.free) + tokensToNumber(account.tokens.owned)
  )
}

export async function accountCredits(
  sessionToken: string,
  account: BillingAccount
) {
  const balance = accountBalance(account)
  const vdaPrice = await getVdaPrice(sessionToken)

  return parseInt((balance / 100.0 / vdaPrice).toString())
}
