export function tokensToNumber(tokens: string): number {
  // Convert to BigInt, then to float by dividing by 1e18
  const tokensBigInt = BigInt(tokens.toString())
  // Potential precision loss for very large amounts
  return Number(tokensBigInt) / 1e18
}
