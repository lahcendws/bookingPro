import { test, expect } from '@playwright/test'

test('clients page requires authentication', async ({ page }) => {
  await page.goto('/dashboard/crm')
  await expect(page).toHaveURL(/.*\/login/)
})
