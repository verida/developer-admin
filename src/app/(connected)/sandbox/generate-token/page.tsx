"use client"

import Image from "next/image"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
// shadcn/ui components (adjust import paths to match your project)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { commonConfig } from "@/config/common"
import { fetchScopes } from "@/features/dcs/api"
import type { Scope } from "@/features/dcs/interfaces"
import { useVerida } from "@/features/verida/hooks/use-verida"

// Default selected scopes (from your legacy code)
const DEFAULT_SCOPES = [
  "api:ds-query",
  "api:llm-agent-prompt",
  "api:llm-profile-prompt",
  "api:search-universal",
  "ds:social-email",
]

// Web Vault OAuth Endpoint
const AUTH_ENDPOINT = commonConfig.VAULT_AUTH_ENDPOINT

// This app
const RETURN_URL = `${commonConfig.BASE_URL}/sandbox/token-generated`

export default function GenerateApiKeyPage() {
  // Fetched scope definitions
  const [scopes, setScopes] = useState<Record<string, Scope>>({})
  const { did } = useVerida()

  // Which scopes are currently selected
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    ...DEFAULT_SCOPES,
  ])

  async function onLoad() {
    setScopes(await fetchScopes())
  }

  useEffect(() => {
    onLoad()
  }, [])

  // Build the connect URL, same logic as legacy:
  function buildConnectUrl(): string {
    const redirectUrl = new URL(AUTH_ENDPOINT)

    for (const scope of selectedScopes) {
      redirectUrl.searchParams.append("scopes", scope)
    }

    redirectUrl.searchParams.append("redirectUrl", RETURN_URL)
    redirectUrl.searchParams.append("appDID", did!)

    return redirectUrl.toString()
  }

  function handleScopeToggle(scope: string, checked: boolean) {
    setSelectedScopes((prev) => {
      if (checked) {
        // Add scope if not already included
        if (!prev.includes(scope)) {
          return [...prev, scope]
        }
        return prev
      } else {
        // Remove scope
        return prev.filter((val) => val !== scope)
      }
    })
  }

  function handleConnectVerida() {
    window.location.href = buildConnectUrl()
  }

  // Render
  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect to Verida</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Use this example page to select the scopes you wish to request, then
            click <strong>Connect Verida</strong> to be directed to the Verida
            Vault to obtain an API authentication token.
          </p>

          {/* Scopes list */}
          <div>
            <h3 className="mb-2 text-lg font-semibold">Available Scopes</h3>
            {Object.entries(scopes).length === 0 && (
              <p className="text-sm text-muted-foreground">Loading scopes...</p>
            )}

            {/* Render scopes in a responsive grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(scopes).map(([scopeKey, scopeDef], idx) => {
                // Skip base64 scopes
                if (scopeKey.match("base64")) {
                  return null
                }

                const isChecked = selectedScopes.includes(scopeKey)
                return (
                  <div key={scopeKey} className="flex items-start space-x-2">
                    <Checkbox
                      id={`scope-${idx}`}
                      checked={isChecked}
                      onCheckedChange={(checked: boolean) =>
                        handleScopeToggle(scopeKey, checked)
                      }
                    />
                    <Label htmlFor={`scope-${idx}`} className="leading-tight">
                      <span className="font-medium">{scopeKey}</span>
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {scopeDef.description}
                      </span>
                    </Label>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Connect Section */}
          <div className="space-y-4">
            <Button
              variant="default"
              onClick={handleConnectVerida}
              className="flex items-center space-x-2"
            >
              <Image
                src="https://assets.verida.io/auth/Connect-Verida.png"
                alt="Connect Verida"
                width={20}
                height={20}
              />
              <span>Connect Verida</span>
            </Button>

            <div>
              <p className="mb-1 text-sm text-muted-foreground">Connect URL:</p>
              <p className="break-all text-sm">{buildConnectUrl()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
