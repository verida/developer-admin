"use client"

import { Info } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { accountUsage, getAccount, registerAccount } from "@/features/dcs/api"
import type { BillingAccount, UsageStats } from "@/features/dcs/interfaces"
import { accountCredits } from "@/features/dcs/utils"
import { useVeridaAuth } from "@/features/verida-auth/hooks/use-verida-auth"

export default function DashboardPage() {
  const { authDetails } = useVeridaAuth()

  // TODO: Optimise by creating queries for these states and a mutation for the registration
  const [account, setAccount] = useState<BillingAccount | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

  const loadAccount = useCallback(async () => {
    if (!authDetails?.token) {
      return
    }

    const account = await getAccount(authDetails.token)

    if (account) {
      setAccount(account)
      setCredits(await accountCredits(authDetails.token, account))
      setUsageStats(await accountUsage(authDetails.token))
    }
  }, [authDetails])

  const handleRegisterClick = useCallback(async () => {
    if (!authDetails?.token) {
      return
    }

    const newAccount = await registerAccount(authDetails.token)

    if (newAccount) {
      loadAccount()
    }
  }, [authDetails, loadAccount])

  useEffect(() => {
    loadAccount()
  }, [loadAccount])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>
        {/* TODO: Display user name from its profile, have to fetch it */}
        Welcome <span>{authDetails?.did}</span>
      </p>
      {account ? (
        <>
          {credits !== null ? (
            <p>
              You currently have{" "}
              {/* TODO: Add link to credits page when fixed
              <Link href="/credits" className="font-semibold underline">
                {`${credits} credits`}
              </Link> */}
              <span className="font-semibold">{`${credits} credits`}</span>.
            </p>
          ) : null}
          {usageStats ? (
            <>
              <p>
                <span className="font-semibold">
                  {usageStats.connectedAccounts}
                </span>{" "}
                accounts have connected to your application.
              </p>
              <p>
                <span className="font-semibold">{usageStats.requests}</span> API
                requests have been served.
              </p>
            </>
          ) : null}
        </>
      ) : (
        <Alert variant="default">
          <Info className="h-5 w-5" />
          <AlertTitle>Registration required!</AlertTitle>
          <div className="flex flex-col gap-2">
            <AlertDescription>
              You must register your developer account, and obtain 200 free VDA
              credits for API usage.
            </AlertDescription>
            <Button
              variant="outline"
              onClick={handleRegisterClick}
              className="w-fit"
            >
              Register
            </Button>
          </div>
        </Alert>
      )}
    </div>
  )
}
DashboardPage.displayName = "DashboardPage"
