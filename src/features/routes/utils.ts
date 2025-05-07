export function getRootPageRoute() {
  return `/`
}

export function getAuthPageRoute(basePath?: string) {
  return `${basePath ?? ""}/auth`
}

export function getCreditsPageRoute() {
  return "/credits"
}

export function getDashboardPageRoute() {
  return "/dashboard"
}

export function getSandboxPageRoute() {
  return "/sandbox"
}

export function getApiRequestsPageRoute() {
  return `${getSandboxPageRoute()}/api-requests`
}

export function getBrowseDataPageRoute() {
  return `${getSandboxPageRoute()}/browse-data`
}

export function getGenerateTokenPageRoute() {
  return `${getSandboxPageRoute()}/generate-token`
}

export function getTokenGeneratedPageRoute() {
  return `${getSandboxPageRoute()}/token-generated`
}

export function getTokenInfoPageRoute() {
  return `${getSandboxPageRoute()}/token-info`
}

export function getDefaultRedirectPathAfterAuthentication() {
  return getDashboardPageRoute()
}
