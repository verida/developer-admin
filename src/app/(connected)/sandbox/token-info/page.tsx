"use client"

import React, { useCallback, useEffect, useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchTokenData } from "@/features/dcs/api"
import { SANDBOX_AUTH_TOKEN_STORAGE_KEY } from "@/features/sandbox/constants"

export default function TokenInfoPage() {
  const [token, setTokenInternal] = useState("")
  const [tokenInfo, setTokenInfo] = useState<Record<string, unknown> | null>(
    null
  )
  const [error, setError] = useState("")
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [newToken, setNewToken] = useState("")

  const setToken = useCallback((_token: string | null) => {
    setTokenInternal(_token || "")
    if (_token) {
      localStorage.setItem(SANDBOX_AUTH_TOKEN_STORAGE_KEY, _token)
    } else {
      localStorage.removeItem(SANDBOX_AUTH_TOKEN_STORAGE_KEY)
    }
  }, [])

  const handleClearToken = useCallback(() => {
    setToken(null)
    setTokenInfo(null)
  }, [setToken])

  const handleFetchTokenInfo = useCallback(async (_token: string) => {
    try {
      setError("")
      setTokenInfo(null)
      const _tokenInfo = await fetchTokenData(_token)
      setTokenInfo(_tokenInfo)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong getting the token info"
      )
    }
  }, [])

  useEffect(() => {
    // Triggered only on mount
    const storedToken = localStorage.getItem(SANDBOX_AUTH_TOKEN_STORAGE_KEY)
    if (storedToken) {
      setToken(storedToken)
    }
  }, [setToken])

  useEffect(() => {
    if (!token) {
      return
    }

    handleFetchTokenInfo(token).catch(() => {
      // TODO: handle error
    })
  }, [handleFetchTokenInfo, token])

  const handleLoadToken = useCallback(() => {
    setToken(newToken)
    setLoadDialogOpen(false)
    setNewToken("")
  }, [newToken, setToken])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Info</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {token ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="loaded-token">Token:</Label>
            <Input id="loaded-token" value={token} readOnly />
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>No token loaded</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          {token ? (
            <Button variant="outline" onClick={handleClearToken}>
              Clear Token
            </Button>
          ) : (
            <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Load token</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Load a new token</DialogTitle>
                  <DialogDescription>
                    Enter your API token below and click <strong>Load</strong>.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label htmlFor="loadTokenInput">API Token</Label>
                  <Textarea
                    id="loadTokenInput"
                    placeholder="Paste your API token here"
                    value={newToken}
                    onChange={(e) => setNewToken(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button onClick={handleLoadToken}>Load</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>Error: {error}</AlertDescription>
          </Alert>
        ) : null}
        {tokenInfo ? (
          <pre className="overflow-auto rounded bg-muted p-4 text-sm">
            {JSON.stringify(tokenInfo, null, 2)}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  )
}
