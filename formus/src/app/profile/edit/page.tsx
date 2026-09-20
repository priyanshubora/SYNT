import { redirect } from 'next/navigation'

import ForumShell from '@/components/forum/forum-shell'
import EditProfileForm from '@/components/forum/edit-profile-form'

import { createClient } from '@/lib/supabase/server'

export default async function EditProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/profile/edit')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'username, avatar_url, team_id'
    )
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/profile')
  }

  const { data: teams } = await supabase
    .from('teams')
    .select('id, name, logo_url')
    .order('name', {
      ascending: true,
    })

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
            Edit Profile
          </h1>

          <p
            className="mt-1 text-xs"
            style={{
              color:
                'var(--text-muted)',
            }}
          >
            Change your SNYT profile
            information.
          </p>

        </div>

        <EditProfileForm
          username={profile.username}
          avatarUrl={profile.avatar_url}
          currentTeamId={profile.team_id}
          teams={teams ?? []}
        />

      </div>
    </ForumShell>
  )
}