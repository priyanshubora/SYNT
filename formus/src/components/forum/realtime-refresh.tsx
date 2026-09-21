'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type RealtimeRefreshProps = {
  tableFilters?: Array<{
    table: string
    filter?: string
  }>
  channelName?: string
}

export default function RealtimeRefresh({
  tableFilters = [
    { table: 'threads' },
    { table: 'comments' },
    { table: 'thread_votes' },
  ],
  channelName = 'forum-live-updates',
}: RealtimeRefreshProps) {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName)

    for (const { table, filter } of tableFilters) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        () => {
          router.refresh()
        },
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, router, tableFilters])

  return null
}
