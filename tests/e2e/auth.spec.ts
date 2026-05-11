import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
  test("sign-up page renders correctly", async ({ page }) => {
    await page.goto("/sign-up")
    await expect(page.getByRole("heading", { name: /créer/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
  })

  test("sign-in page renders correctly", async ({ page }) => {
    await page.goto("/sign-in")
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible()
  })

  test("redirects unauthenticated user from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/sign-in/)
  })

  test("shows validation error on empty sign-in", async ({ page }) => {
    await page.goto("/sign-in")
    await page.getByRole("button", { name: /connexion/i }).click()
    // Form validation should prevent submission or show an error
    await expect(page).toHaveURL(/sign-in/)
  })
})
