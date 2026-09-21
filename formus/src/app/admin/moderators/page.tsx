import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import { createClient } from '@/lib/supabase/server'
import ModeratorManager from './moderator-manager'

export default async function ModeratorsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin/moderators')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect('/profile')
  }

  const { data: users } = await supabase
    .from('profiles')
    .select(
      `
        id,
        username,
        avatar_url,
        role,
        created_at
      `,
    )
    .order('username', {
      ascending: true,
    })

  return (
    <ForumShell>
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-6">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              color: 'var(--accent)',
            }}
          >
            Administration
          </div>

          <h1
            className="mt-1 text-xl font-bold"
            style={{
              color: 'var(--text-primary)',
            }}
          >
            Manage Moderators
          </h1>

          <p
            className="mt-1 text-xs"
            style={{
              color: 'var(--text-muted)',
            }}
          >
            Promote users to moderators or remove moderator
            permissions.
          </p>
        </div>

        <ModeratorManager
          initialUsers={users ?? []}
          currentUserId={user.id}
        />
      </div>
    </ForumShell>
  )
}