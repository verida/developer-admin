const apiPrefix = `/api/rest/v1`

/**
 * Interfaces
 */

export interface EndpointParam {
  type: string
  required?: boolean
  documentation: string
  default?: string | number | boolean
}

export interface EndpointVariable {
  type: string
  required: boolean
  documentation: string
  preProcessing?: any
  default?: string | number | boolean
}

export interface EndpointParams {
  query: EndpointParam
  options: any
}

export interface EndpointDefinition {
  method: "POST" | "GET" | "PUT" | "DELETE"
  path: string
  documentation: string
  urlVariables?: Record<string, EndpointVariable>
  params?: Record<string, EndpointParam>
}

/**
 * Definitions
 */

export const commonParams: Record<string, EndpointParam> = {
  provider: {
    type: "string",
    required: true,
    documentation: "The name of the provider to connect to, ie: `google`",
    default: "google",
  },
  providerId: {
    type: "string",
    required: false,
    documentation:
      "The unique provider ID to use. For example, if you have two Google accounts connected, you can specify which account. The provider ID is listed in the /dashboard/connections table.",
  },
  query: {
    type: "object",
    required: false,
    documentation: `A <a href=\"https://pouchdb.com/api.html#query_index\">pouchdb style filter</a>.
                
**Example:**

\`\`\`
{
    category: "sport",
    insertedAt: {
        "$gte": "2020-01-01"
    }
}
\`\`\`
`,
  },
  options: {
    type: "object",
    required: false,
    documentation: `Additional options provided as JSON. Available options are; sort, limit, skip as per the <a href=\"https://pouchdb.com/api.html#query_index\">pouchdb documentation</a>.

**Example:**

\`\`\`
{
    sort: [{
        _id: "desc"
    }],
    limit: 20,
    skip: 0
}
\`\`\`
`,
    default: JSON.stringify({
      sort: [
        {
          _id: "desc",
        },
      ],
      limit: 20,
      skip: 0,
    }),
  },
}

export const commonUrlVariables: Record<string, EndpointVariable> = {
  databaseName: {
    type: "string",
    required: true,
    documentation: "The name of the database (ie: `social_chat_group`).",
  },
  schemaUrl: {
    type: "string",
    required: true,
    documentation:
      "The base64 encoded URL of the datastore schema (ie: `https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json` is encoded to `aHR0cHM6Ly9jb21tb24uc2NoZW1hcy52ZXJpZGEuaW8vc29jaWFsL2NoYXQvZ3JvdXAvdjAuMS4wL3NjaGVtYS5qc29u`).\n\nEnter the schema URL in the input box and it will be automatically converted to base64.",
    preProcessing: (value: any) => btoa(value),
    default:
      "https://common.schemas.verida.io/social/chat/group/v0.1.0/schema.json",
  },
}

// Global JSON object with endpoint configurations
export const apiEndpoints: Record<string, EndpointDefinition> = {
  "/ds/query/{schemaUrl}": {
    method: "POST",
    path: `${apiPrefix}/ds/query/{schemaUrl}`,
    documentation: "Query a datastore",
    urlVariables: {
      schemaUrl: commonUrlVariables.schemaUrl!,
    },
    params: {
      query: commonParams.query!,
      options: {
        type: "object",
        required: false,
        documentation:
          'Additional options provided as JSON. Available options are; sort, limit, skip as per the <a href="https://pouchdb.com/api.html#query_index">pouchdb documentation</a>.',
        default: JSON.stringify({
          sort: [
            {
              _id: "desc",
            },
          ],
          limit: 20,
        }),
      },
    },
  },
  "/ds/count/{schemaUrl}": {
    method: "POST",
    path: `${apiPrefix}/ds/count/{schemaUrl}`,
    documentation: "Count the number of records in a datastore",
    urlVariables: {
      schemaUrl: commonUrlVariables.schemaUrl!,
    },
    params: {
      query: commonParams.query!,
    },
  },
  "/ds/get/{schemaUrl}/{recordId}": {
    method: "GET",
    path: `${apiPrefix}/ds/get/{schemaUrl}/{recordId}`,
    documentation: "Retrieves a record from a datastore.",
    urlVariables: {
      schemaUrl: commonUrlVariables.schemaUrl!,
      recordId: {
        type: "string",
        required: true,
        documentation: "The unique ID of the record to fetch.",
      },
    },
  },
  "/db/query/{databaseName}": {
    method: "POST",
    path: `${apiPrefix}/db/query/{databaseName}`,
    documentation: "Query a database",
    urlVariables: {
      databaseName: commonUrlVariables.databaseName!,
    },
    params: {
      query: commonParams.query!,
      options: commonParams.options!,
    },
  },
  "/db/get/{databaseName}/{recordId}": {
    method: "GET",
    path: `${apiPrefix}/db/get/{databaseName}/{recordId}`,
    documentation: "Retrieves a record from a database.",
    urlVariables: {
      databaseName: commonUrlVariables.databaseName!,
      recordId: {
        type: "string",
        required: true,
        documentation: "The unique ID of the record to fetch.",
      },
    },
  },
  "/search/universal": {
    method: "GET",
    path: `${apiPrefix}/search/universal`,
    documentation: "Universal keyword search across multiple datastores",
    params: {
      keywords: {
        type: "string",
        documentation: "List of keywords to search for",
        default: "robert gray",
        required: true,
      },
      limit: {
        type: "number",
        documentation: "Limit results. Defaults to `20`.",
        default: 5,
      },
      minResultsPerType: {
        type: "number",
        documentation:
          "Minimum number of results per type (ie: `emails`). Defaults to `5`.",
        default: 5,
      },
      searchTypes: {
        type: "string",
        documentation: `Comma separated list of record types to search:

- chat-messages: Individual chat messages
- emails: Individual emails
- favorites: Individual favorites
- following: Individual social media accounts followed
- posts: Individual social media posts

Defaults to \`"emails,chat-messages"\`.
`,
        default: `emails,chat-messages`,
      },
    },
  },
  "/search/datastore/{schemaUrl}": {
    method: "POST",
    path: `${apiPrefix}/search/datastore/{schemaUrl}`,
    documentation: `Execute a keyword search on a datastore.

It's possible to define the fields to index on and the fields to be stored in the search index which is then returned with results.

The index is cached for the user, until the user cache times out.

Requests with the exact same list of indexed and stored fields will re-use the same index. If there is any difference in the indexed or stored fields, a new index is created, which increases the memory footprint.

Returns:

- \`total\` - Total number of search results found in the search index
- \`items\` - Array of item results
`,
    urlVariables: {
      schemaUrl: commonUrlVariables.schemaUrl!,
    },
    params: {
      keywords: {
        type: "string",
        documentation: "List of keywords to search for",
        default: "robert gray",
        required: true,
      },
      index: {
        type: "object",
        documentation: "Array of fields to include in the search index",
        default: JSON.stringify([
          "name",
          "description",
          "favouriteType",
          "sourceApplication",
        ]),
        required: true,
      },
      options: {
        type: "object",
        documentation: `Search options that match the options available from the [minisearch documentation](https://www.npmjs.com/package/minisearch).

**Example:**

\`\`\`
{
    "fields": ["name", "description"],
    "searchOptions": {
        "boost": { "name": 2 },
        "fuzzy": 0.2
    }
}
\`\`\`
`,
        default: JSON.stringify({}),
      },
      limit: {
        type: "number",
        documentation:
          "Limit how many chat threads to return. Defaults to `20`.",
        default: 20,
      },
      fields: {
        type: "object",
        documentation:
          "Comma separated list of fields to include in search index (ie: `name,description`)",
        default: JSON.stringify(["name", "description"]),
      },
      store: {
        type: "object",
        documentation:
          "Comma separated list of fields to store in the index and return with results (ie: `name,description`)",
        default: JSON.stringify(["name", "description"]),
      },
    },
  },
  "/search/chatThreads": {
    method: "GET",
    path: `${apiPrefix}/search/chatThreads`,
    documentation: `Search chat messages by keyword and return matching chat threads to ensure the full message context is available.

Each result contains the chat group and an array of messages.`,
    params: {
      keywords: {
        type: "string",
        documentation: "List of keywords to search for",
        default: "robert gray",
        required: true,
      },
      limit: {
        type: "number",
        documentation:
          "Limit how many chat threads to return. Defaults to `20`.",
        default: 5,
      },
      merge: {
        type: "boolean",
        documentation:
          "Merge overlapping threads. If two messages match within the same chat group, they are merged to produce a single chat group.",
        default: true,
      },
    },
  },
  "/llm/prompt": {
    method: "POST",
    path: `${apiPrefix}/llm/prompt`,
    documentation: `Send a LLM prompt request to a pre-configured LLM.`,
    params: {
      prompt: {
        type: "string",
        required: true,
        documentation: `User prompt (ie: \`Who hosted the 2000 olympics?\`)`,
      },
    },
  },
  "/llm/agent": {
    method: "POST",
    path: `${apiPrefix}/llm/agent`,
    documentation: `Send a LLM prompt request to the built-in personal AI Agent.`,
    params: {
      prompt: {
        type: "string",
        required: true,
        documentation: `User prompt (ie: \`How much have I spent on software this quarter?\`)`,
      },
    },
  },
  "/connections/profiles": {
    method: "GET",
    path: `${apiPrefix}/connections/profiles`,
    documentation: `Fetch the profile of a connection (ie: "google" or "telegram").`,
    params: {
      providerId: {
        type: "string",
        required: false,
        documentation: `Optional filter to return profile of a specific provider (ie: "google" or "telegram")`,
      },
    },
  },
  "/connections/status": {
    method: "GET",
    path: `${apiPrefix}/connections/status`,
    documentation: `Access status information on connected third party accounts (ie: Google, Telegram)`,
    params: {
      providerId: {
        type: "string",
        required: false,
        documentation: `Optional filter to return profile of a specific provider (ie: "google" or "telegram")`,
      },
    },
  },
}
