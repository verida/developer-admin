"use client"

import React, { useEffect, useState } from "react"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
// Example API fetcher (replace with your actual API logic)
import { fetchTokenData } from "@/features/dcs/api"

// Helper to mask token (first 8, then "..............", then last 8)
function maskToken(token: string) {
  // If shorter than 16, just show all
  if (token.length < 16) return token
  const start = token.slice(0, 8)
  const end = token.slice(-8)
  return `${start}..............${end}`
}

export default function TokenInfoPage() {
  const [token, setToken] = useState<string>("")
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [error, setError] = useState<string>("")

  // State for "Load token" dialog
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [newToken, setNewToken] = useState<string>("")

  // State for "View current token" dialog
  const [viewDialogOpen, setViewDialogOpen] = useState<boolean>(false)
  const [viewToken, setViewToken] = useState<string>("")

  // On page load, read token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setToken(storedToken)
      // Auto-fetch info
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

  // Load (save) new token from the "Load token" dialog
  function handleLoadToken() {
    localStorage.setItem("authToken", newToken)
    setToken(newToken)
    setDialogOpen(false)
    handleFetchTokenInfo(newToken)
  }

  // View the current token in a dialog
  function handleViewCurrentToken() {
    const storedToken = localStorage.getItem("authToken")
    if (storedToken) {
      setViewToken(storedToken)
      setViewDialogOpen(true)
    } else {
      setError("No token found in local storage.")
    }
  }

  // Copy token to clipboard
  function handleCopyToken() {
    navigator.clipboard.writeText(viewToken).then(() => {})
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Token Info</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {token ? (
            <div className="space-y-2">
              <Label>Current token</Label>
              <Input value={maskToken(token)} readOnly />
            </div>
          ) : (
            <Alert variant="destructive">No token loaded</Alert>
          )}

          <div className="flex flex-wrap gap-2">
            {/* Load token dialog */}
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

            {/* View current token dialog */}
            <Button variant="outline" onClick={handleViewCurrentToken}>
              View current token
            </Button>
            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Current Token</DialogTitle>
                  <DialogDescription>
                    Below is your full token from local storage.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <Label>Token (full)</Label>
                  <div className="flex items-center gap-2">
                    <Input value={viewToken} readOnly className="flex-1" />
                    <Button variant="secondary" onClick={handleCopyToken}>
                      Copy
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="default"
                    onClick={() => setViewDialogOpen(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
