"use client"

import Image from "next/image"
import Link from "next/link"
import React, { useEffect, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { commonConfig } from "@/config/common"
import { fetchScopes } from "@/features/dcs/api"
import type { Scope } from "@/features/dcs/interfaces"
import { useVeridaAuth } from "@/features/verida-auth/hooks/use-verida-auth"

const DEFAULT_SCOPES = [
  "api:ds-query",
  "api:llm-agent-prompt",
  "api:llm-profile-prompt",
  "api:search-universal",
  "ds:social-email",
]

const AUTH_ENDPOINT = commonConfig.VAULT_AUTH_ENDPOINT
const RETURN_URL = `${commonConfig.BASE_URL}/sandbox/token-generated`

export default function GenerateApiKeyPage() {
  const [scopes, setScopes] = useState<Record<string, Scope>>({})
  const { authDetails } = useVeridaAuth()
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    ...DEFAULT_SCOPES,
  ])

  async function onLoad() {
    setScopes(await fetchScopes())
  }

  useEffect(() => {
    onLoad()
  }, [])

  function buildConnectUrl(): string {
    if (!authDetails?.did) {
      return "#"
    }

    const redirectUrl = new URL(AUTH_ENDPOINT)
    for (const scope of selectedScopes) {
      redirectUrl.searchParams.append("scopes", scope)
    }
    redirectUrl.searchParams.append("redirectUrl", RETURN_URL)
    redirectUrl.searchParams.append("appDID", authDetails?.did)
    return redirectUrl.toString()
  }

  function handleScopeToggle(scope: string, checked: boolean) {
    setSelectedScopes((prev) => {
      if (checked) {
        if (!prev.includes(scope)) {
          return [...prev, scope]
        }
        return prev
      } else {
        return prev.filter((val) => val !== scope)
      }
    })
  }

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
            {Object.entries(scopes).length === 0 && (
              <p className="text-sm text-muted-foreground">Loading scopes...</p>
            )}

            {/* Collapsible sections for different scope groups */}

            <Accordion type="multiple">
              <AccordionItem value="api">
                <AccordionTrigger>API Scopes</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(scopes)
                      .filter(([key, scope]) => scope.type === "api")
                      .map(([scopeKey, scopeDef], idx) => {
                        const isChecked = selectedScopes.includes(scopeKey)
                        return (
                          <div
                            key={scopeKey}
                            className="flex items-start space-x-2"
                          >
                            <Checkbox
                              id={`scope-${idx}`}
                              checked={isChecked}
                              onCheckedChange={(checked: boolean) =>
                                handleScopeToggle(scopeKey, checked)
                              }
                            />
                            <Label
                              htmlFor={`scope-${idx}`}
                              className="whitespace-normal break-words leading-tight"
                            >
                              <span className="font-medium">{scopeKey}</span>
                              <br />
                              <span className="text-sm text-muted-foreground">
                                {scopeDef.description}
                              </span>
                              {scopeDef.credits && (
                                <div className="mt-1 text-sm text-muted-foreground">
                                  <strong>{scopeDef.credits}</strong> credits
                                </div>
                              )}
                            </Label>
                          </div>
                        )
                      })}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="datastore">
                <AccordionTrigger>Datastore Scopes</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(scopes)
                      .filter(([key, scope]) => scope.type === "ds")
                      .map(([scopeKey, scopeDef], idx) => {
                        const isChecked = selectedScopes.includes(scopeKey)
                        return (
                          <div
                            key={scopeKey}
                            className="flex items-start space-x-2"
                          >
                            <Checkbox
                              id={`scope-${idx}`}
                              checked={isChecked}
                              onCheckedChange={(checked: boolean) =>
                                handleScopeToggle(scopeKey, checked)
                              }
                            />
                            <Label
                              htmlFor={`scope-${idx}`}
                              className="whitespace-normal break-words leading-tight"
                            >
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
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <Separator />

          {/* Connect Section */}
          <div className="space-y-4">
            <Button className="w-fit" asChild>
              <Link
                href={buildConnectUrl()}
                className="flex flex-row items-center gap-2"
              >
                <Image
                  src="/images/verida-network-logo.svg"
                  alt="Verida Network Logo"
                  className="size-6 text-foreground"
                  width={144}
                  height={144}
                />
                <span>Connect Verida</span>
              </Link>
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
