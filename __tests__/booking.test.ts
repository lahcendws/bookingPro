import { describe, it, expect } from 'vitest'
import { computeEffectiveHours, DEFAULT_HOURS } from '@/lib/booking-availability'

describe('Booking Availability & Hours', () => {
  it('should compute effective hours filling missing days with defaults', () => {
    const customHours = [
      {
        day_of_week: 1, // Monday
        is_open: true,
        open_time: '10:00',
        close_time: '18:00',
        break_start: null,
        break_end: null,
      },
    ]

    const effective = computeEffectiveHours(customHours)
    expect(effective).toHaveLength(7)

    // Monday should be custom
    const monday = effective.find(h => h.day_of_week === 1)
    expect(monday?.open_time).toBe('10:00')
    expect(monday?.close_time).toBe('18:00')

    // Tuesday should be default (09:00 - 20:00)
    const tuesday = effective.find(h => h.day_of_week === 2)
    expect(tuesday?.open_time).toBe('09:00')
    expect(tuesday?.close_time).toBe('20:00')
  })
})
