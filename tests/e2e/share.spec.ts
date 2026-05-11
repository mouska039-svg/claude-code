import { test, expect } from "@playwright/test"

test.describe("Share page", () => {
  test("returns 404 for invalid token", async ({ page }) => {
    const response = await page.goto("/share/invalid-token-that-does-not-exist")
    // Next.js notFound() renders a 404 page
    expect(response?.status()).toBe(404)
  })

  test("returns 404 for expired/missing token", async ({ page }) => {
    const response = await page.goto("/share/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    expect(response?.status()).toBe(404)
  })
})
