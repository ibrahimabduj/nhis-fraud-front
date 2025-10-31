const BASE_URL = import.meta.env.VITE_BACKEND_URL || ""

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`GET ${path} failed: ${res.status} ${text}`)
  }
  return (await res.json()) as T
}

export async function postMultipart<T>(path: string, form: FormData, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    body: form,
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`POST ${path} failed: ${res.status} ${text}`)
  }
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return (await res.json()) as T
  }
  // Allow unknown response types (e.g., empty responses)
  return undefined as unknown as T
}

export async function putJson<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`PUT ${path} failed: ${res.status} ${text}`)
  }
  if (res.status === 204) {
    // Allow void responses for 204 No Content
    return undefined as unknown as T
  }
  return (await res.json()) as T
}


