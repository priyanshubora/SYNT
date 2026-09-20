import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import SettingsForm from '@/components/forum/settings-form'

import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/settings')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'username, avatar_url, show_online_status'
    )
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/profile')
  }

  return (
    <ForumShell>
      <div className="mx-auto max-w-[800px]">

        <div className="mb-5">
          <h1
            className="text-xl font-bold"
            style={{
              color:
                'var(--text-primary)',
            }}
          >
            Settings
          </h1>

          <p
            className="mt-1 text-xs"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Manage your SNYT profile and
            privacy settings.
          </p>
        </div>

        <SettingsForm
          username={profile.username}
          avatarUrl={profile.avatar_url}
          showOnlineStatus={
            profile.show_online_status
          }
        />

      </div>
    </ForumShell>
  )
}