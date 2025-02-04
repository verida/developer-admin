"use client"

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiEndpoints } from "@/config/apiEndpoints"
import { commonConfig } from "@/config/common"
import { SCHEMA_MAP } from "@/features/dcs/schemas"

// Example "apiEndpoints" object from endpoints.js
// (truncated for brevity—include all endpoints as needed)
const BASE_API = commonConfig.DCS_URL

type EndpointKey = keyof typeof apiEndpoints

// For code language selection
const CODE_LANGUAGES = ["curl", "nodejs", "jquery", "php", "python"] as const
type CodeLang = (typeof CODE_LANGUAGES)[number]

export default function ApiRequestsPage() {
  const router = useRouter()

  // -- Authentication Key (from localStorage) --
  const [veridaKey, setVeridaKey] = useState<string | null>(null)

  // -- Selected Endpoint & Base URL --
  const [endpoint, setEndpoint] = useState<EndpointKey>("/ds/query/{schemaUrl}")
  const [baseUrl, setBaseUrl] = useState<string>(BASE_API)

  // -- Private Key Visibility --
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false)

  // -- Code Language Selection --
  const [codeLang, setCodeLang] = useState<CodeLang>("curl")

  // -- URL Variables & Params State --
  const [urlVariables, setUrlVariables] = useState<Record<string, any>>({})
  const [params, setParams] = useState<Record<string, any>>({})

  // -- API Request Result --
  const [result, setResult] = useState<string>("")
  const [resultErrorMessage, setResultErrorMessage] = useState<string>("")
  const [resultError, setResultError] = useState<string>("")

  const [isSchemaListOpen, setIsSchemaListOpen] = useState<boolean>(false)
  const [schemaUrl, setSchemaUrl] = useState<string>("")

  // On mount, load the veridaKey from localStorage
  useEffect(() => {
    const key = localStorage.getItem("authToken")
    setVeridaKey(key)
  }, [router])

  // Initialize form fields when endpoint changes
  useEffect(() => {
    const config = apiEndpoints[endpoint]!

    // Initialize urlVariables
    if (config.urlVariables) {
      const defaults: Record<string, any> = {}
      for (const [varName, varObj] of Object.entries(config.urlVariables)) {
        defaults[varName] = varObj.default || ""
      }
      setUrlVariables(defaults)
    } else {
      setUrlVariables({})
    }

    // Initialize params
    if (config.params) {
      const defaults: Record<string, any> = {}
      for (const [paramName, paramObj] of Object.entries(config.params)) {
        defaults[paramName] = paramObj.default || ""
      }
      setParams(defaults)
    } else {
      setParams({})
    }

    setResult("")
    setResultError("")
    setResultErrorMessage("")
  }, [endpoint])

  // Build code examples for each language
  function buildCodeExamples() {
    const config = apiEndpoints[endpoint]!
    const method = config.method
    let builtUrl = (baseUrl || "") + config.path

    // Replace {variable} in URL
    if (config.urlVariables) {
      for (const [varName, varObj] of Object.entries(config.urlVariables)) {
        let val = urlVariables[varName]
        if (val && varObj.preProcessing) {
          val = varObj.preProcessing(val)
        }
        // If missing, keep the {varName} placeholder
        if (val) {
          builtUrl = builtUrl.replace(`{${varName}}`, encodeURIComponent(val))
        }
      }
    }

    // Build data object
    const data: Record<string, any> = {}
    if (config.params) {
      for (const [paramName, paramObj] of Object.entries(config.params)) {
        let pval = params[paramName]
        // If it's JSON, parse it (some endpoints require JSON)
        if (paramObj.type === "object" || isLikelyJsonString(pval)) {
          try {
            pval = JSON.parse(pval)
          } catch (err) {
            // fallback: treat as string if invalid JSON
          }
        }
        if (pval !== undefined && pval !== "") {
          data[paramName] = pval
        }
      }
    }

    const displayedKey =
      showPrivateKey && veridaKey ? veridaKey : "<privateKey>"

    // --- cURL ---
    let curl = `curl -X ${method} `
    if (displayedKey) {
      curl += `-H "Authorization: Bearer ${displayedKey}" `
    }
    if (method === "GET" && Object.keys(data).length > 0) {
      // append ?param=value
      const queryString = new URLSearchParams(data as any).toString()
      curl += `"${builtUrl}?${queryString}"`
    } else if (method === "POST" || method === "PUT" || method === "DELETE") {
      curl += `"${builtUrl}" \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(data)}'`
    } else {
      curl += `"${builtUrl}"`
    }

    // --- Node.js (axios) ---
    const nodeCode = `const axios = require('axios');

axios({
  method: '${method}',
  url: '${builtUrl}',
  ${method === "GET" ? `params: ${JSON.stringify(data, null, 2)},` : `data: ${JSON.stringify(data, null, 2)},`}
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${displayedKey}'
  }
})
.then(res => {
  console.log(res.data)
})
.catch(err => {
  console.error(err)
})
`

    // --- jQuery ---
    const jq = `$.ajax({
  url: '${builtUrl}',
  method: '${method}',
  ${method === "GET" ? `data: ${JSON.stringify(data)},` : `data: JSON.stringify(${JSON.stringify(data)}),`}
  contentType: 'application/json',
  headers: {
    'Authorization': 'Bearer ${displayedKey}'
  },
  success: function(response) {
    console.log(response);
  },
  error: function(xhr, status, error) {
    console.error(error);
  }
});`

    // --- PHP (cURL) ---
    const queryStr =
      method === "GET" && Object.keys(data).length > 0
        ? "?" + new URLSearchParams(data as any).toString()
        : ""
    const php = `<?php
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => "${builtUrl}${queryStr}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${method}",
  ${
    ["POST", "PUT", "DELETE"].includes(method)
      ? `CURLOPT_POSTFIELDS => '${JSON.stringify(data)}',`
      : ""
  }
  CURLOPT_HTTPHEADER => array(
    "Content-Type: application/json",
    "Authorization: Bearer ${displayedKey}"
  ),
));

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}`

    // --- Python ---
    const pyData =
      method === "GET"
        ? `params = ${JSON.stringify(data, null, 2)}`
        : `json = ${JSON.stringify(data, null, 2)}`
    const python = `import requests

url = "${builtUrl}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${displayedKey}"
}
${pyData}

response = requests.${method.toLowerCase()}(url, ${method === "GET" ? "params=params" : "json=json"}, headers=headers)

print(response.json())`

    return { curl, nodejs: nodeCode, jquery: jq, php, python }
  }

  // Run the endpoint with a fetch
  async function handleRunEndpoint() {
    try {
      setResult("Request sent... waiting...")

      const config = apiEndpoints[endpoint]!
      let builtUrl = (baseUrl || "") + config.path
      const method = config.method

      // Prepare URL variables
      if (config.urlVariables) {
        for (const [varName, varObj] of Object.entries(config.urlVariables)) {
          let val = urlVariables[varName]
          if (val && varObj.preProcessing) {
            val = varObj.preProcessing(val)
          }
          if (val) {
            builtUrl = builtUrl.replace(`{${varName}}`, encodeURIComponent(val))
          }
        }
      }

      // Prepare data
      const data: Record<string, any> = {}
      if (config.params) {
        for (const [paramName, paramObj] of Object.entries(config.params)) {
          let pval = params[paramName]
          if (paramObj.type === "object" || isLikelyJsonString(pval)) {
            try {
              pval = pval ? JSON.parse(pval) : {}
            } catch (err) {
              // fallback: treat as string
            }
          }
          if (pval !== undefined && pval !== "") {
            data[paramName] = pval
          }
        }
      }

      const headers: Record<string, string> = {}
      if (veridaKey) {
        headers["Authorization"] = `Bearer ${veridaKey}`
      }
      headers["Content-Type"] = "application/json"

      let fetchUrl = builtUrl
      const fetchOptions: RequestInit = {
        method,
        headers,
      }

      if (method === "GET") {
        if (Object.keys(data).length > 0) {
          const qs = new URLSearchParams(data as any).toString()
          fetchUrl += `?${qs}`
        }
      } else {
        fetchOptions.body = JSON.stringify(data)
      }

      setResult("")
      const res = await fetch(fetchUrl, fetchOptions)
      if (!res.ok) {
        const text = await res.text()
        setResultErrorMessage(res.statusText)
        setResultError(JSON.stringify(JSON.parse(text), null, 2))
      } else {
        const jsonData = await res.json()
        setResult(JSON.stringify(jsonData, null, 2))
      }
    } catch (err: any) {
      setResultError(String(err))
    }
  }

  // Render dynamic fields for urlVariables
  function renderUrlVariableFields() {
    const config = apiEndpoints[endpoint]!
    if (!config.urlVariables) return null

    return Object.entries(config.urlVariables).map(([varName, varObj]) => (
      <div key={varName} className="space-y-1">
        <Label htmlFor={`urlVar-${varName}`}>
          {varName}
          {varObj.required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        <Input
          id={`urlVar-${varName}`}
          value={
            varName == "schemaUrl" && schemaUrl
              ? schemaUrl
              : (urlVariables[varName] ?? "")
          }
          onChange={(e) =>
            setUrlVariables((prev) => ({
              ...prev,
              [varName]: e.target.value,
            }))
          }
        />
        <div className="text-sm text-gray-600">
          <ReactMarkdown>{varObj.documentation}</ReactMarkdown>
        </div>
        {varName == "schemaUrl" && (
          <Dialog open={isSchemaListOpen} onOpenChange={setIsSchemaListOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="ml-2">
                List available schemas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schemas</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {Object.entries(SCHEMA_MAP).map(([name, url]) => (
                  <div key={name}>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSchemaUrl(url)
                        setIsSchemaListOpen(false)
                      }}
                    >
                      {name}
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    ))
  }

  // Render dynamic fields for params
  function renderParamsFields() {
    const config = apiEndpoints[endpoint]!
    if (!config.params) return null

    return Object.entries(config.params).map(([paramName, paramObj]) => {
      const isTextArea =
        paramObj.type === "object" || isLikelyJsonString(paramObj.default)
      return (
        <div key={paramName} className="space-y-1">
          <Label htmlFor={`param-${paramName}`}>
            {paramName}
            {paramObj.required && <span className="ml-1 text-red-500">*</span>}
          </Label>
          {isTextArea ? (
            <Textarea
              id={`param-${paramName}`}
              value={params[paramName] ?? ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  [paramName]: e.target.value,
                }))
              }
              rows={5}
            />
          ) : (
            <Input
              id={`param-${paramName}`}
              value={params[paramName] ?? ""}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  [paramName]: e.target.value,
                }))
              }
              placeholder={paramObj.documentation || paramName}
            />
          )}
          <div className="text-sm text-gray-600">
            <ReactMarkdown>{paramObj.documentation}</ReactMarkdown>
          </div>
        </div>
      )
    })
  }

  // Build code examples once in render
  const codeSamples = buildCodeExamples()

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Developer API Interface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Use this interface to easily generate API queries on your data.</p>
          <p>
            API queries are using the token saved at the
            <Link href="/sandbox/token-info">Token Info</Link> page
          </p>

          {/* Endpoint Selector */}
          <div className="space-y-1">
            <Label htmlFor="endpointSelect">Select Endpoint</Label>
            <Select
              value={endpoint}
              onValueChange={(val: EndpointKey) => setEndpoint(val)}
            >
              <SelectTrigger id="endpointSelect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(apiEndpoints).map(([key, cfg]) => {
                  const text = `${cfg.method} ${key}`
                  return (
                    <SelectItem key={key} value={key as EndpointKey}>
                      {text}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Base URL Input (optional) */}
          <div className="space-y-1">
            <Label htmlFor="baseUrl">API Server URL Endpoint</Label>
            <Input
              id="baseUrl"
              value={baseUrl || ""}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your.custom.server"
            />
          </div>

          {/* URL Variables */}
          {Object.entries(apiEndpoints[endpoint]!.urlVariables || {}).length >
            0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">URL Variables</h3>
              {renderUrlVariableFields()}
            </div>
          )}

          {/* Params */}
          {Object.entries(apiEndpoints[endpoint]!.params || {}).length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Parameters</h3>
              {renderParamsFields()}
            </div>
          )}

          {/* Run Endpoint Button */}
          <Button onClick={handleRunEndpoint}>Run Endpoint</Button>

          {/* Code Examples */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <Label>Select Language</Label>
                <Select
                  value={codeLang}
                  onValueChange={(val: CodeLang) => setCodeLang(val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CODE_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showPrivateKey"
                  checked={showPrivateKey}
                  onCheckedChange={(checked) => setShowPrivateKey(!!checked)}
                />
                <Label htmlFor="showPrivateKey">Show Private Key</Label>
              </div>
            </div>

            <div className="rounded border bg-muted p-4">
              <pre className="whitespace-pre-wrap text-sm">
                {codeSamples[codeLang]}
              </pre>
            </div>
          </div>

          {/* Result */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              Result {resultError ? "(Error)" : ""}
            </h3>
            <pre
              id="result"
              className="min-h-[200px] overflow-auto rounded bg-muted p-4 text-sm"
            >
              {resultError}
              {result}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper: detect if a string might be JSON
function isLikelyJsonString(str: any) {
  if (typeof str !== "string") return false
  const trimmed = str.trim()
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  )
}
