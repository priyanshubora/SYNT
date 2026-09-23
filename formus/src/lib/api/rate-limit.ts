import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export type MutationRateLimitBucket =
  | 'reports.create'
  | 'moderation.report_status'
  | 'moderation.action'
  | 'admin.moderators'
  | 'account.delete'
  | 'auth.signout'

export async function enforceMutationRateLimit(
  supabase: SupabaseClient,
  bucket: MutationRateLimitBucket,
): Promise<NextResponse | null> {
  const { data, error } = await supabase.rpc(
    'consume_mutation_rate_limit',
    { p_bucket: bucket },
  )

  if (error) {
    console.error('Mutation rate limit check failed:', error)
    return NextResponse.json(
      { error: 'Request protection is temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result?.allowed) {
    const retryAfter = Math.max(1, Number(result?.retry_after_seconds) || 60)
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Cache-Control': 'private, no-store',
          'Retry-After': String(retryAfter),
        },
      },
    )
  }

  return null
}
