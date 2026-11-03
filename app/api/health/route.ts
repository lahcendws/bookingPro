import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logStructured } from '@/lib/logger'

export async function GET(request: Request) {
  const start = Date.now()
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID()
  const supabase = await createClient()

  try {
    // Check DB connectivity & latency
    const dbStart = Date.now()
    const { error } = await supabase.from('businesses').select('id').limit(1)
    const dbDuration = Date.now() - dbStart

    if (error) {
      logStructured('error', 'HEALTH_CHECK_DB_ERROR', undefined, requestId, Date.now() - start, { error: error.message })
      return NextResponse.json({
        status: 'DATABASE ERROR',
        error: error.message,
        request_id: requestId,
      }, { status: 500 })
    }

    const totalDuration = Date.now() - start
    if (totalDuration > 1000) {
      logStructured('warn', 'HEALTH_CHECK_HIGH_LATENCY', undefined, requestId, totalDuration)
      return NextResponse.json({
        status: 'HIGH LATENCY',
        duration_ms: totalDuration,
        request_id: requestId,
      }, { status: 200 })
    }

    logStructured('info', 'HEALTH_CHECK_OK', undefined, requestId, totalDuration)
    return NextResponse.json({
      status: 'UP',
      db_latency_ms: dbDuration,
      duration_ms: totalDuration,
      request_id: requestId,
    }, { status: 200 })

  } catch (err: any) {
    logStructured('error', 'HEALTH_CHECK_DOWN', undefined, requestId, Date.now() - start, { error: err.message })
    return NextResponse.json({
      status: 'DOWN',
      error: err.message,
      request_id: requestId,
    }, { status: 500 })
  }
}
