import { test, expect } from '@playwright/test'

test('inventory page requires authentication', async ({ page }) => {
  await page.goto('/dashboard/inventory')
  await expect(page).toHaveURL(/.*\/login/)
})
