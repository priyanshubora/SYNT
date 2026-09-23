export const MAX_JSON_BODY_BYTES = 16 * 1024

export type JsonObjectResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; status: 400 | 413 | 415; message: string }

export async function readJsonObject(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<JsonObjectResult> {
  const contentType = request.headers
    .get('content-type')
    ?.split(';', 1)[0]
    .trim()
    .toLowerCase()

  if (contentType !== 'application/json') {
    return { ok: false, status: 415, message: 'Expected a JSON request body.' }
  }

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, status: 413, message: 'Request body is too large.' }
  }

  if (!request.body) {
    return { ok: false, status: 400, message: 'Invalid request body.' }
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel()
        return { ok: false, status: 413, message: 'Request body is too large.' }
      }
      chunks.push(value)
    }
  } catch {
    return { ok: false, status: 400, message: 'Invalid request body.' }
  }

  const bytes = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return { ok: false, status: 400, message: 'Expected a JSON object.' }
    }
    return { ok: true, value: value as Record<string, unknown> }
  } catch {
    return { ok: false, status: 400, message: 'Invalid request body.' }
  }
}

export async function hasUnexpectedBody(request: Request): Promise<boolean> {
  if (!request.body) return false

  const reader = request.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return false
      if (value.byteLength > 0) {
        await reader.cancel()
        return true
      }
    }
  } catch {
    return true
  } finally {
    reader.releaseLock()
  }
}

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
