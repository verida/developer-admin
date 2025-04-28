"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { fetchTokenData } from "@/features/dcs/api"

function maskToken(token: string) {
  // If shorter than 16, just show all
  if (token.length < 16) return token
  const start = token.slice(0, 8)
  const end = token.slice(-8)
  return `${start}..............${end}`
}

export default function ApiKeyGeneratedPage() {
  const searchParams = useSearchParams()
  const [apiKey, setApiKey] = useState<string>("")
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<Record<string, unknown>>({})

  function saveApiKey(key?: string) {
    localStorage.setItem("authToken", key || apiKey)
  }

  async function onLoad() {
    // Get the "auth_token" parameter
    const key = searchParams.get("auth_token")
    if (key) {
      setApiKey(key)
      const result = await fetchTokenData(key)
      setTokenData(result)

      if (!localStorage.getItem("authToken")) {
        saveApiKey(key)
        setApiKeySaved(true)
      }
    }
  }

  useEffect(() => {
    onLoad()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold">Auth Token Generated</h1>
      <div>
        <p>
          Congratulations! You have successfully created a Verida Auth Token.
          You can now use it to{" "}
          <Link href="/sandbox/browse-data">Browse your data</Link> or{" "}
          <Link href="/sandbox/api-requests">Make API requests</Link>.
        </p>

        <pre className="mt-4">{maskToken(apiKey)}</pre>
        {apiKeySaved && (
          <Alert variant="default" className="mb-3">
            <AlertTitle>Key saved</AlertTitle>
            <AlertDescription>
              This Auth Token has been saved to local storage so you can use
              easily it with the sandbox
            </AlertDescription>
          </Alert>
        )}
        {apiKey && !apiKeySaved && (
          <Button variant="default" onClick={() => saveApiKey(undefined)}>
            Save Auth Token
          </Button>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold">Token Data</h2>
        <pre className="mt-4">{JSON.stringify(tokenData, null, 2)}</pre>
      </div>
    </div>
  )
}
