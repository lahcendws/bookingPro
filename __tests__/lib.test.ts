import { describe, it, expect } from 'vitest'
import { slugify, getTenantSlug } from '@/lib/utils'

describe('Utils & Slugify', () => {
  it('should slugify strings correctly', () => {
    expect(slugify('Salon de Beaute & Spa')).toBe('salon-de-beaute-spa')
    expect(slugify('  Barber Shop 3000! ')).toBe('barber-shop-3000')
  })

  it('should extract tenant slug from hostname correctly', () => {
    expect(getTenantSlug('salon-maya.bookingpro.app')).toBe('salon-maya')
    expect(getTenantSlug('bookingpro.app')).toBeNull()
    expect(getTenantSlug('localhost:3000')).toBeNull()
  })
})
