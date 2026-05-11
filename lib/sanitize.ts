import DOMPurify from "dompurify"

export function sanitizeHtml(dirty: string): string {
  if (typeof window === "undefined") {
    // Server-side: strip all tags via simple regex (DOMPurify needs a DOM)
    return dirty.replace(/<[^>]*>/g, "")
  }
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}
