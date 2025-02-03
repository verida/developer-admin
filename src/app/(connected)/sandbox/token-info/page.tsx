"use client"

import React, { useEffect, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
// shadcn/ui components (adjust import paths to match your setup)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
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

// Helper to mask token (first 6, then "....", then last 6)
function maskToken(token: string) {
  const start = token.slice(0, 8)
  const end = token.slice(-8)
  return `${start}..............${end}`
}

export default function TokenInfoPage() {
  const [token, setToken] = useState<string>("")
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [error, setError] = useState<string>("")

  // Manage dialog open state for "Load token"
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [newToken, setNewToken] = useState<string>("") // For the dialog input

  // On page load, read from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
      // Auto-fetch info once loaded
      handleFetchTokenInfo(storedToken)
    }
  }, [])

  // Fetch token info from your API
  async function handleFetchTokenInfo(forcedToken?: string) {
    try {
      setError("")
      setTokenInfo(null)

      const currentToken = forcedToken ?? token
      if (!currentToken) {
        setError("No token to fetch info for.")
        return
      }

      const data = await fetchTokenData(currentToken)
      setTokenInfo(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  // Handle "Load" inside the modal
  function handleLoadToken() {
    // Save new token to localStorage
    localStorage.setItem("authToken", newToken)
    setToken(newToken)

    // Close dialog
    setDialogOpen(false)

    // Fetch token info right away
    handleFetchTokenInfo(newToken)
  }

  // View the current token from local storage
  function handleViewCurrentToken() {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      alert(`Current token in local storage:\n\n${storedToken}`)
    } else {
      alert("No token found in local storage.")
    }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Info</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Masked token display (read-only). Show if we have a token in state */}
          {token ? (
            <div className="space-y-2">
              <Label>Current token</Label>
              <Input value={maskToken(token)} readOnly />
            </div>
          ) : (
            <Alert variant="destructive">No token loaded</Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Load token (opens dialog) */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  <Button
                    variant="secondary"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleLoadToken}>Load</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Manually re-fetch token info */}
            <Button onClick={() => handleFetchTokenInfo()}>Fetch</Button>

            {/* View the full stored token in an alert */}
            <Button variant="outline" onClick={handleViewCurrentToken}>
              View current token
            </Button>
          </div>

          {/* Error or token info display */}
          {error && <p className="text-red-500">Error: {error}</p>}
          {tokenInfo && (
            <pre className="overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
