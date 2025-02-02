"use client"

import { Info } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { accountUsage, getAccount, registerAccount } from "@/features/dcs/api"
import type { BillingAccount, UsageStats } from "@/features/dcs/interfaces"
import { accountCredits } from "@/features/dcs/utils"
import { useVerida } from "@/features/verida/hooks/use-verida"

// webUserInstanceRef
export default function DashboardPage() {
  const { did, profile, getAccountSessionToken } = useVerida()
  const [account, setAccount] = useState<BillingAccount | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null)

  // const imgSrc = `data:image/png;base64,${profile?.avatarUri}`

  async function handleRegisterClick() {
    // Place your registration logic here
    const sessionToken = await getAccountSessionToken()
    const newAccount = await registerAccount(sessionToken)

    if (newAccount) {
      loadAccount()
    }
  }

  // A function that does something on mount
  async function loadAccount() {
    const sessionToken = await getAccountSessionToken()
    const account = await getAccount(sessionToken)

    if (account) {
      setAccount(account)
      setCredits(await accountCredits(sessionToken, account))
      setUsageStats(await accountUsage(sessionToken))
    }
  }

  // Run the function once, when the component mounts
  useEffect(() => {
    loadAccount()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-4">
        Welcome <strong>{profile?.name}</strong> (
        <span className="mt-4 text-sm">{did}</span>)
      </p>
      {!account && (
        <Alert variant="default" className="mt-10 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            {/* Info icon (instead of a warning or error icon) */}
            <Info className="mt-1 h-5 w-5" />
            <div>
              <AlertTitle>Registration required!</AlertTitle>
              <AlertDescription>
                You must register your developer account, and obtain 200 free
                VDA credits for API usage.
              </AlertDescription>
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={handleRegisterClick}>
              Register
            </Button>
          </div>
        </Alert>
      )}
      {account && (
        <div>
          <div>
            {credits && (
              <p className="mt-4">
                You currently have{" "}
                <Link href="/credits">
                  <u>
                    <strong>{credits}</strong> credits
                  </u>
                  .
                </Link>
              </p>
            )}
          </div>
          <div>
            {usageStats && (
              <div>
                <p className="mt-4">
                  <strong>{usageStats.connectedAccounts}</strong> accounts have
                  connected to your application.
                </p>
                <p className="mt-4">
                  <strong>{usageStats.requests}</strong> API requests have been
                  served.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

DashboardPage.displayName = "DashboardPage"
