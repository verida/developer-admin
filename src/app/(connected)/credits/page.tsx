"use client"

import { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAccount, getVdaPrice, submitDeposit } from "@/features/dcs/api"
import type { BillingAccount } from "@/features/dcs/interfaces"
import { accountBalance, accountCredits } from "@/features/dcs/utils"

// Regex for validating Ethereum/Polygon addresses
const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/

export default function CreditsPage() {
  // Track current step (1 or 2)
  const [step, setStep] = useState<number>(1)

  // Form fields
  const [walletAddress, setWalletAddress] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [transactionHash, setTransactionHash] = useState("")

  const [account, setAccount] = useState<BillingAccount | null>(null)
  const [credits, setCredits] = useState<number | null>(null)

  // Validation errors
  const [addressError, setAddressError] = useState("")
  const [tokenAmountError, setTokenAmountError] = useState("")
  const [submitError, setSubmitError] = useState("")

  // Handle "Next Step" button (Step 1 -> Step 2)
  function handleNextStep() {
    let valid = true

    // Validate wallet address
    if (!ethAddressRegex.test(walletAddress)) {
      setAddressError(
        "Please enter a valid Polygon address (0x followed by 40 hex characters)."
      )
      valid = false
    } else {
      setAddressError("")
    }

    // Validate token amount (1,000 - 100,000)
    const amountNum = Number(tokenAmount)
    if (isNaN(amountNum) || amountNum < 1000 || amountNum > 100000) {
      setTokenAmountError(
        "Please enter a number between 1,000 and 100,000 tokens."
      )
      valid = false
    } else {
      setTokenAmountError("")
    }

    if (valid) {
      setStep(2)
    }
  }

  // Handle "Back" button (Step 2 -> Step 1)
  function handleBack() {
    setStep(1)
  }

  // Handle "Submit Deposit" button on Step 2
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError("")

    if (!transactionHash) {
      setSubmitError(
        "Please enter the transaction hash to submit your deposit."
      )
      return
    }

    // If we get here, we have transactionHash
    // const sessionToken = await getAccountSessionToken()

    try {
      // await submitDeposit(
      //   veridaAccount,
      //   sessionToken,
      //   walletAddress,
      //   tokenAmount,
      //   transactionHash
      // )

      // Reload account so new credits are displayed
      // await loadAccount()

      // Reset the form
      setWalletAddress("")
      setTokenAmount("")
      setTransactionHash("")
      handleBack()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "An unknown error occurred"
      )
    }
  }

  // const loadAccount = useCallback(async () => {
  //   // const sessionToken = await getAccountSessionToken()
  //   const account = await getAccount(sessionToken)

  //   if (account) {
  //     setAccount(account)
  //     const credits = await accountCredits(sessionToken, account)
  //     // eslint-disable-next-line no-console -- TODO: Replace with Logger
  //     console.log(credits)
  //     if (credits) {
  //       setCredits(credits)
  //     }
  //   }
  // }, [])

  // A function that does something on mount
  const onLoad = useCallback(async () => {
    // await loadAccount()
  }, [])

  // Run the function once, when the component mounts
  useEffect(() => {
    onLoad()
  }, [onLoad])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Credits {credits ? `(${credits})` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            {credits && (
              <p className="mt-4">
                You currently have <strong>{credits}</strong> credits.
              </p>
            )}
            <p className="mt-4">
              You can add credits by sending VDA tokens to{" "}
              <strong>0x8B1D662274b9f6a2cEEA10eAed46Ef56d54F824e</strong> on the{" "}
              <strong>Polygon PoS Network</strong>.
            </p>
            <p className="mt-4">
              Register your deposit by entering the transaction details below.
            </p>
          </div>
          {/* Display Current Credits */}
          <div className="mb-3">
            <Label htmlFor="currentBalance" className="mb-1 block">
              VDA Balance
            </Label>
            <Input
              id="currentBalance"
              disabled
              value={account ? accountBalance(account) : ""}
            />
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div id="step1">
                {/* Wallet Address */}
                <div className="mb-3">
                  <Label htmlFor="walletAddress">
                    Your Polygon Wallet Address
                  </Label>
                  <Input
                    id="walletAddress"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                  {addressError && (
                    <p className="mt-1 text-sm text-red-500">{addressError}</p>
                  )}
                </div>

                {/* Number of VDA Tokens */}
                <div className="mb-3">
                  <Label htmlFor="tokenAmount">Number of VDA Tokens Sent</Label>
                  <Input
                    type="number"
                    id="tokenAmount"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    placeholder="Minimum 1,000"
                    required
                  />
                  {tokenAmountError && (
                    <p className="mt-1 text-sm text-red-500">
                      {tokenAmountError}
                    </p>
                  )}
                </div>

                {/* Next Step Button */}
                <Button
                  type="button"
                  variant="default"
                  onClick={handleNextStep}
                >
                  Next Step
                </Button>
              </div>
            )}

            {step === 2 && (
              <div id="step2">
                <h3 className="mb-3 text-xl font-semibold">
                  Complete Your Transaction
                </h3>

                {/* Transaction Hash */}
                <div className="mb-3">
                  <Label htmlFor="transactionHash">Transaction Hash</Label>
                  <Input
                    id="transactionHash"
                    placeholder="0x..."
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    required
                  />
                </div>

                {/* Error or alert for missing transactionHash */}
                {submitError && (
                  <Alert variant="destructive" className="mb-3">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                {/* Submit & Back Buttons */}
                <Button type="submit" variant="default" className="mr-2">
                  Submit Deposit
                </Button>
                <Button type="button" variant="secondary" onClick={handleBack}>
                  Back
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
