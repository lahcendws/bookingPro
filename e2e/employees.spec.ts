import { test, expect } from '@playwright/test'

test('employees settings require authentication', async ({ page }) => {
  await page.goto('/dashboard/settings')
  await expect(page).toHaveURL(/.*\/login/)
})
