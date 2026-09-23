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
  ignoreVoteUpdatesForUserId?: string | null
}

const DEFAULT_TABLE_FILTERS = [
  { table: 'threads' },
  { table: 'comments' },
  { table: 'thread_votes' },
]

export default function RealtimeRefresh({
  tableFilters = DEFAULT_TABLE_FILTERS,
  channelName = 'forum-live-updates',
  ignoreVoteUpdatesForUserId = null,
}: RealtimeRefreshProps) {
  const router = useRouter()
  const tableFiltersKey = JSON.stringify(tableFilters)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(channelName)
    let refreshTimer: ReturnType<typeof setTimeout> | null = null

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer)

      refreshTimer = setTimeout(() => {
        refreshTimer = null
        router.refresh()
      }, 250)
    }

    const filters = JSON.parse(tableFiltersKey) as typeof tableFilters

    for (const { table, filter } of filters) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          if (
            ignoreVoteUpdatesForUserId &&
            (table === 'thread_votes' || table === 'comment_votes')
          ) {
            const newRow = payload.new as { user_id?: string } | null
            const oldRow = payload.old as { user_id?: string } | null

            if (
              newRow?.user_id === ignoreVoteUpdatesForUserId ||
              oldRow?.user_id === ignoreVoteUpdatesForUserId
            ) {
              return
            }
          }

          scheduleRefresh()
        },
      )
    }

    channel.subscribe()

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer)
      supabase.removeChannel(channel)
    }
  }, [channelName, ignoreVoteUpdatesForUserId, router, tableFiltersKey])

  return null
}
