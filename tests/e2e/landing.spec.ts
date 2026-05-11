import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("has sign-in and sign-up links", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /connexion/i })).toBeVisible()
  })

  test("pricing section is visible", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /tarif/i }).first().click()
    await expect(page.getByText(/gratuit/i).first()).toBeVisible()
  })

  test("sign-in link navigates correctly", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /connexion/i }).click()
    await expect(page).toHaveURL(/sign-in/)
  })
})
