import type {
  VeridaAuthErrorInfo,
  VeridaAuthResponseError,
} from "@/features/verida-auth/type"

export const AUTH_TOKEN_LOCAL_STORAGE_KEY =
  "verida_dev_console_verida_auth_token"

export const VERIDA_AUTH_REQUIRED_SCOPES: string[] = ["api:app-developer"]

export const VERIDA_AUTH_ERROR_MESSAGES: Record<
  VeridaAuthResponseError,
  VeridaAuthErrorInfo
> = {
  access_denied: {
    title: "Access Denied",
    description: "You have denied access to your Verida account.",
  },
  invalid_request: {
    title: "Invalid Request",
    description: "The authentication request was invalid. Please try again.",
  },
  server_error: {
    title: "Server Error",
    description:
      "An error occurred on the authentication server. Please try again later.",
  },
  unknown: {
    title: "Unknown Error",
    description: "An unexpected error occurred during authentication.",
  },
}
