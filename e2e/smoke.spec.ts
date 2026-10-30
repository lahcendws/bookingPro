import { test, expect } from '@playwright/test'

test('self-hosted mode redirects root to login', async ({ page }) => {
  await page.goto('/')
  // In self-hosted mode (default), root / redirects to /login
  await expect(page).toHaveURL(/.*\/login/)
})

test('offline page loads correctly', async ({ page }) => {
  await page.goto('/offline')
  await expect(page.locator('body')).toBeVisible()
})
