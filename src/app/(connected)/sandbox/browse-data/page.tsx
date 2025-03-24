"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
// shadcn/ui components (adjust imports to match your project)
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { commonConfig } from "@/config/common"
import { SCHEMA_MAP } from "@/features/dcs/schemas"

interface ApiItem {
  [key: string]: any
}

interface QueryResponse {
  items: ApiItem[]
  options: {
    skip: number
  }
}

const BASE_API = `${commonConfig.DCS_URL}/api/rest/v1`

export default function BrowseDataPage() {
  const router = useRouter()

  // ----------------------------
  // States matching your original logic
  // ----------------------------
  const [veridaKey, setVeridaKey] = useState<string | null>(null)

  const [schema, setSchema] = useState<string>("")
  const [limit, setLimit] = useState<number>(10)
  const [offset, setOffset] = useState<number>(0)

  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const [items, setItems] = useState<ApiItem[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [filterMap, setFilterMap] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")

  // Manage the modals (filter, destroy, schema list)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const [isDestroyOpen, setIsDestroyOpen] = useState<boolean>(false)
  const [isSchemaListOpen, setIsSchemaListOpen] = useState<boolean>(false)

  // ----------------------------
  // On mount, check localStorage (like account.js logic)
  // If no key, redirect to /login
  // ----------------------------
  useEffect(() => {
    const key = localStorage.getItem("authToken")
    if (!key) {
      router.push("/sandbox/generate-token")
      return
    }

    setVeridaKey(key)

    // You may also fetch account info here if needed (similar to account.js).
    // e.g., fetch /api/rest/v1/account/fromKey?key=${key} ...
  }, [router])

  // ----------------------------
  // Load initial form values (similar to setInitialValues())
  // If you have query params, parse them (like data.js does),
  // else use defaults. For simplicity, we’ll just load from localStorage here.
  // ----------------------------
  useEffect(() => {
    // Default to "Connections" schema or the first in SCHEMA_MAP
    // or load from localStorage, etc.
    const storedSchema =
      localStorage.getItem("schema") || SCHEMA_MAP["Connections"]
    setSchema(storedSchema!)

    // In your original code, limit=10, offset=0 by default
    setLimit(10)
    setOffset(0)
    setSortField("")
    setSortDirection("asc")
    setFilterMap({})
  }, [])

  // ----------------------------
  // Fetch data from the server (like fetchData() in data.js)
  // We call this whenever [schema, limit, offset, sortField, sortDirection, filterMap] changes
  // ----------------------------
  useEffect(() => {
    if (!veridaKey || !schema) return

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [veridaKey, schema, limit, offset, sortField, sortDirection, filterMap])

  async function fetchData() {
    try {
      setErrorMessage("")
      setItems([])

      const sortOption = sortField
        ? [{ [sortField]: sortDirection }]
        : undefined
      const body = {
        options: {
          limit,
          skip: offset,
          sort: sortOption,
        },
        query: filterMap,
      }

      const encodedSchema = btoa(schema) // base64 of the schema
      const response = await fetch(`${BASE_API}/ds/query/${encodedSchema}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer: ${veridaKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "An error occurred")
      }

      const data = (await response.json()) as QueryResponse

      // If we got results
      setItems(data.items || [])

      // Extract headers (keys from first item)
      if (data.items?.length) {
        const firstItem = data.items[0]
        setHeaders(Object.keys(firstItem!))
      } else {
        setHeaders([])
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred")
    }
  }

  // ----------------------------
  // Handling user input (equivalent to your jQuery code)
  // ----------------------------
  function handleSearch() {
    // Just re-trigger fetchData by changing offset or some state if needed
    setOffset(0) // Reset offset to 0 on new search
    fetchData()
  }

  function handlePrev() {
    if (offset <= 0) return
    setOffset(offset - limit)
  }

  function handleNext() {
    // If we want to handle “no more items,” we might need the total count from the server
    // For now, just increment offset blindly
    setOffset(offset + limit)
  }

  // ----------------------------
  // Sorting
  // ----------------------------
  function handleSortByHeader(header: string) {
    if (header === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(header)
      setSortDirection("asc")
    }
  }

  // ----------------------------
  // Apply filters from the filter modal
  // ----------------------------
  function applyFilters(newFilters: Record<string, string>) {
    setFilterMap(newFilters)
    setOffset(0)
    setIsFilterOpen(false)
  }

  // ----------------------------
  // Delete row
  // ----------------------------
  async function handleDeleteRow(id: string) {
    if (!confirm("Are you sure you want to delete this row?")) return

    try {
      const baseUrl = "/api/rest/v1"
      const encodedSchema = btoa(schema)
      const url = `${baseUrl}/ds/${encodedSchema}?id=${id}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          key: veridaKey!,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "An error occurred deleting the row")
      }

      alert("Row deleted successfully")
      fetchData()
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting the row")
    }
  }

  // ----------------------------
  // Destroy (drop) the entire DB
  // ----------------------------
  async function handleConfirmDestroy() {
    setIsDestroyOpen(false)
    try {
      const baseUrl = "/api/rest/v1"
      const encodedSchema = btoa(schema)
      const url = `${baseUrl}/ds/${encodedSchema}?destroy=true`

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          key: veridaKey!,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "An error occurred destroying the DB")
      }

      alert("Database destroyed successfully")
      fetchData()
    } catch (err: any) {
      alert(err.message || "An error occurred while destroying the database")
    }
  }

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Browse Data</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <p>
            Use this interface to browse the data connected via your API key.
          </p>
          <p>
            API queries are using the token saved at the
            <Link href="/sandbox/token-info">Token Info</Link> page
          </p>

          {/* Query Form */}
          <div className="space-y-4">
            {/* Schema */}
            <div>
              <Label htmlFor="schema">Schema:</Label>
              <Input
                id="schema"
                value={schema}
                onChange={(e) => {
                  setSchema(e.target.value)
                  localStorage.setItem("schema", e.target.value)
                }}
                placeholder="Enter a schema URL..."
              />
              {/* Link to open schema modal */}
              <Dialog
                open={isSchemaListOpen}
                onOpenChange={setIsSchemaListOpen}
              >
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
                            setSchema(url)
                            localStorage.setItem("schema", url)
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
            </div>

            {/* Limit, Offset, Sort */}
            <div className="grid gap-4 md:grid-cols-4">
              {/* Limit */}
              <div>
                <Label htmlFor="limit">Limit</Label>
                <Select
                  value={String(limit)}
                  onValueChange={(val) => setLimit(Number(val))}
                >
                  <SelectTrigger id="limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Offset */}
              <div>
                <Label htmlFor="offset">Offset</Label>
                <Input
                  id="offset"
                  type="number"
                  value={offset}
                  onChange={(e) => setOffset(Number(e.target.value))}
                />
              </div>

              {/* Sort Field */}
              <div>
                <Label htmlFor="sortField">Sort By</Label>
                <Select
                  value={sortField}
                  onValueChange={(val) => {
                    setSortField(val)
                    setSortDirection("asc")
                  }}
                >
                  <SelectTrigger id="sortField">
                    <SelectValue placeholder="(none)" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* We’ll populate dynamic fields below if we have them */}
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Direction */}
              <div>
                <Label htmlFor="sortDirection">Direction</Label>
                <Select
                  value={sortDirection}
                  onValueChange={(val) =>
                    setSortDirection(val as "asc" | "desc")
                  }
                >
                  <SelectTrigger id="sortDirection">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Asc</SelectItem>
                    <SelectItem value="desc">Desc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Buttons: Search, Open Filters, Destroy */}
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={handleSearch}>
                Search
              </Button>

              {/* Filter Modal */}
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary">Open Filters</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    <DialogDescription>
                      Specify filters for each column
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {headers.length > 0 ? (
                      headers.map((header) => (
                        <div key={header}>
                          <Label htmlFor={`filter-${header}`}>{header}</Label>
                          <Input
                            id={`filter-${header}`}
                            value={filterMap[header] || ""}
                            onChange={(e) =>
                              setFilterMap((prev) => ({
                                ...prev,
                                [header]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      ))
                    ) : (
                      <p>No headers available yet.</p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => applyFilters(filterMap)}
                      type="button"
                    >
                      Apply Filters
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Destroy Modal */}
              <Dialog open={isDestroyOpen} onOpenChange={setIsDestroyOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Destroy</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Destroy</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to destroy the database? This cannot
                      be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="secondary"
                      onClick={() => setIsDestroyOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDestroy}
                    >
                      Destroy
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Show currently applied filters */}
            <div className="text-sm text-muted-foreground">
              {Object.keys(filterMap).length > 0 && (
                <div>
                  <strong>Applied Filters:</strong>{" "}
                  {Object.entries(filterMap)
                    .map(([field, val]) => `${field}: ${val}`)
                    .join(", ")}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="mt-6 overflow-auto">
        <table className="w-full min-w-[600px] border text-sm">
          <thead className="border-b bg-muted text-muted-foreground">
            <tr>
              {headers.map((header) => {
                const isSorted = header === sortField
                const sortIcon = isSorted
                  ? sortDirection === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""
                return (
                  <th
                    key={header}
                    onClick={() => handleSortByHeader(header)}
                    className="cursor-pointer px-4 py-2 text-left"
                  >
                    {header}
                    {sortIcon}
                  </th>
                )
              })}
              {/* Action column */}
              {headers.length > 0 && <th className="px-4 py-2">Action</th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={headers.length + 1} className="py-4 text-center">
                  No data
                </td>
              </tr>
            ) : (
              items.map((row) => {
                const rowId = row._id || ""
                return (
                  <tr key={rowId} className="border-b last:border-0">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2">
                        {escapeHtml(row[h])}
                      </td>
                    ))}
                    <td className="px-4 py-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteRow(rowId)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex gap-2">
        <Button variant="outline" onClick={handlePrev} disabled={offset <= 0}>
          Previous
        </Button>
        <Button variant="outline" onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}

// Utility function to escape HTML
function escapeHtml(str: any): string {
  if (typeof str !== "string") return String(str ?? "")
  const div = document.createElement("div")
  div.innerText = str
  return div.innerHTML
}
