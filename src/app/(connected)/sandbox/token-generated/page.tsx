"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchTokenData } from "@/features/dcs/api"
import { SANDBOX_AUTH_TOKEN_STORAGE_KEY } from "@/features/sandbox/constants"

export default function ApiKeyGeneratedPage() {
  const searchParams = useSearchParams()
  const [apiKey, setApiKey] = useState<string>("")
  const [apiKeySaved, setApiKeySaved] = useState<boolean>(false)
  const [tokenData, setTokenData] = useState<Record<string, unknown>>({})

  const saveApiKey = useCallback(
    (key?: string) => {
      localStorage.setItem(SANDBOX_AUTH_TOKEN_STORAGE_KEY, key || apiKey)
      setApiKeySaved(true)
    },
    [apiKey]
  )

  const onLoad = useCallback(async () => {
    // Get the "auth_token" parameter
    const key = searchParams.get("auth_token")
    if (key) {
      setApiKey(key)
      const result = await fetchTokenData(key)
      setTokenData(result)

      if (!localStorage.getItem(SANDBOX_AUTH_TOKEN_STORAGE_KEY)) {
        saveApiKey(key)
        setApiKeySaved(true)
      }
    }
  }, [searchParams, saveApiKey])

  useEffect(() => {
    onLoad()
  }, [onLoad])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Auth Token</CardTitle>
        <CardDescription>
          Congratulations! You have successfully created a Verida Auth Token.
          You can now use it to{" "}
          <Link href="/sandbox/browse-data" className="underline">
            browse your data
          </Link>{" "}
          or{" "}
          <Link href="/sandbox/api-requests" className="underline">
            make API requests
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          {apiKey ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="loaded-token">Token:</Label>
              <Input id="loaded-token" value={apiKey} readOnly />
              {apiKeySaved ? (
                <Alert variant="default" className="mb-3">
                  <AlertTitle>Token saved</AlertTitle>
                  <AlertDescription>
                    This Auth Token has been saved to local storage so you can
                    use easily it with the sandbox
                  </AlertDescription>
                </Alert>
              ) : (
                <Button
                  variant="default"
                  className="w-fit"
                  onClick={() => saveApiKey(undefined)}
                >
                  Save Auth Token
                </Button>
              )}
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>No token found</AlertDescription>
            </Alert>
          )}
        </div>
        {tokenData ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold">Token info</h2>
            <pre className="overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
