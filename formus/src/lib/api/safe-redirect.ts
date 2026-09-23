export function getSafeRedirectPath(
  requestedPath: string,
  origin: string,
): string {
  try {
    const requestedUrl = new URL(requestedPath, origin)
    if (requestedUrl.origin !== origin) return '/'

    return `${requestedUrl.pathname}${requestedUrl.search}${requestedUrl.hash}`
  } catch {
    return '/'
  }
}
