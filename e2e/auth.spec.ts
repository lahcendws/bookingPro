import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should display login page and handle invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Try invalid login
    await page.fill('input[type="email"]', 'wrong@bookingpro.app')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should remain on login
    await expect(page).toHaveURL(/.*\/login/)
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('a[href="/register"]')
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/.*\/register/)
    }
  })
})
