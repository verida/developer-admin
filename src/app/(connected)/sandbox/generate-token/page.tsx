"use client"

import Link from "next/link"
import React, { useEffect, useMemo, useState } from "react"

import { VeridaNetworkLogo } from "@/assets/verida-network-logo"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { commonConfig } from "@/config/common"
import { fetchScopes } from "@/features/dcs/api"
import type { Scope } from "@/features/dcs/interfaces"
import { getTokenGeneratedPageRoute } from "@/features/routes/utils"
import { useVeridaAuth } from "@/features/verida-auth/hooks/use-verida-auth"
import type { VeridaAuthRequest } from "@/features/verida-auth/type"
import { buildVeridaAuthRequestUrl } from "@/features/verida-auth/utils"

const DEFAULT_SCOPES = [
  "api:ds-query",
  "api:llm-agent-prompt",
  "api:llm-profile-prompt",
  "api:search-universal",
  "ds:social-email",
]

export default function GenerateApiKeyPage() {
  const [scopes, setScopes] = useState<Record<string, Scope>>({})
  const { authDetails } = useVeridaAuth()
  const [selectedScopes, setSelectedScopes] = useState<string[]>(DEFAULT_SCOPES)

  async function onLoad() {
    // TODO: Optimise with a React Query hook
    setScopes(await fetchScopes())
  }

  useEffect(() => {
    onLoad()
  }, [])

  const sandboxVeridaAuthRequestUrl = useMemo(() => {
    if (!authDetails?.did) {
      return "#"
    }

    const request: VeridaAuthRequest = {
      appDid: authDetails.did,
      payer: "app",
      scopes: selectedScopes,
      redirectUrl: `${commonConfig.BASE_URL}${getTokenGeneratedPageRoute()}`,
    }

    const url = buildVeridaAuthRequestUrl(request)
    return url.toString()
  }, [authDetails?.did, selectedScopes])

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
    <Card>
      <CardHeader>
        <CardTitle>Connect to Verida</CardTitle>
        <CardDescription>
          Use this example page to select the scopes you wish to request, then
          click <strong className="font-semibold">Connect Verida</strong> to be
          directed to the Verida Vault to obtain an API authentication token.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Object.entries(scopes).length === 0 && (
          <p className="text-sm text-muted-foreground">Loading scopes...</p>
        )}
        <Accordion type="multiple">
          <AccordionItem value="api">
            <AccordionTrigger>Operations (API) Scopes</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(scopes)
                  .filter(([, scope]) => scope.type === "api")
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
          <AccordionItem value="data">
            <AccordionTrigger>Data Scopes</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(scopes)
                  .filter(([, scope]) => scope.type === "ds")
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

        <div className="flex flex-col gap-4">
          <Button className="w-fit" asChild>
            <Link
              href={sandboxVeridaAuthRequestUrl}
              className="flex flex-row items-center gap-2"
            >
              <VeridaNetworkLogo className="text-primary-foreground" />
              <span>Connect Verida</span>
            </Link>
          </Button>
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Connect URL:</p>
            <p className="break-all text-sm">{sandboxVeridaAuthRequestUrl}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
