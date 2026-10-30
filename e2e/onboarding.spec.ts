import { test, expect } from '@playwright/test'

test('onboarding guard redirects unauthenticated users', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page).toHaveURL(/.*\/login/)
})
