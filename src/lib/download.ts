export function filenameFromContentDisposition(header?: string): string | null {
  if (!header) return null

  const match = header.match(/filename\*=UTF-8''([^;]+)|filename=\"([^\"]+)\"|filename=([^;]+)/i)
  const raw = match?.[1] ?? match?.[2] ?? match?.[3]
  if (!raw) return null

  try {
    return decodeURIComponent(raw.trim())
  } catch {
    return raw.trim()
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

