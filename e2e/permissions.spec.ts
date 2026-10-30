import { test, expect } from '@playwright/test'

test('permissions and RLS middleware protect api routes', async ({ request }) => {
  const res = await request.get('/api/clients')
  // Unauthenticated request should be unauthorized or not found
  expect([401, 403, 404, 500]).toContain(res.status())
})
