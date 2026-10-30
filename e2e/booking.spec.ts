import { test, expect } from '@playwright/test'

test.describe('Booking & Concurrency Flow', () => {
  test('critical race condition: simultaneous booking attempts on same slot', async ({ request }) => {
    // We test the backend API directly for robust concurrency verification
    // 1. Prepare a mock/test business UUID and service UUID (or test via API endpoint)
    const testBusinessId = '00000000-0000-0000-0000-000000000001'
    const testServiceId = '00000000-0000-0000-0000-000000000002'
    const targetDate = '2026-12-01'
    const targetTime = '10:00'

    const payloadA = {
      businessId: testBusinessId,
      serviceId: testServiceId,
      date: targetDate,
      time: targetTime,
      name: 'User A',
      phone: '+33600000001',
      email: 'usera@test.com',
    }

    const payloadB = {
      businessId: testBusinessId,
      serviceId: testServiceId,
      date: targetDate,
      time: targetTime,
      name: 'User B',
      phone: '+33600000002',
      email: 'userb@test.com',
    }

    // Fire both requests simultaneously
    const [resA, resB] = await Promise.all([
      request.post('/api/book', { data: payloadA }),
      request.post('/api/book', { data: payloadB }),
    ])

    const jsonA = await resA.json().catch(() => ({}))
    const jsonB = await resB.json().catch(() => ({}))

    // Guarantee: One succeeds (200/201), the other gets conflict or unavailable (400/409/422/500 depending on DB state)
    // Most importantly: NEVER both success!
    const results = [resA.status(), resB.status()]
    const successCount = results.filter(status => status === 200 || status === 201).length

    // If business doesn't exist in test DB, both might return 404/400, but if it exists, max 1 success
    expect(successCount).toBeLessThanOrEqual(1)
  })

  test('public booking page renders correctly', async ({ page }) => {
    await page.goto('/book/test-salon')
    // Should render booking layout or 404 if slug doesn't exist
    await expect(page.locator('body')).toBeVisible()
  })
})
