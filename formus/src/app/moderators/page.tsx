import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'

import { createClient } from '@/lib/supabase/server'

import ModeratorManager from './moderator-manager'

export default async function ModeratorManagerPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/admin/moderators')
  }

  const { data: profile } =
    await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

  if (
    !profile ||
    profile.role !== 'admin'
  ) {
    redirect('/')
  }

  const { data: users } =
    await supabase
      .from('profiles')
      .select(
        'id, username, role, created_at',
      )
      .order('created_at', {
        ascending: false,
      })

  return (
    <ForumShell>
      <div className="mx-auto max-w-[900px]">
        <div className="mb-5">
          <div
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{
              color:
                'var(--accent)',
            }}
          >
            SNYT Administration
          </div>

          <h1
            className="mt-1 text-xl font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Moderator Management
          </h1>
        </div>

        <ModeratorManager
          users={users ?? []}
        />
      </div>
    </ForumShell>
  )
}