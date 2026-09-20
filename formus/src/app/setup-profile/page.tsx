'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import TeamPicker, {
  type TeamPickerTeam,
} from '@/components/forum/team-picker'

export default function SetupProfilePage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [teams, setTeams] = useState<TeamPickerTeam[]>([])
  const [teamId, setTeamId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProfileSetup() {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/login')
        return
      }

      const { data, error } = await supabase
        .from('teams')
        .select('id, name, logo_url, region')
        .in('region', ['indian', 'international'])
        .order('name')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setTeams((data ?? []) as TeamPickerTeam[])
      setLoading(false)
    }

    loadProfileSetup()
  }, [router])

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')

    const cleanUsername = username.trim()

    if (cleanUsername.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    setSaving(true)

    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username: cleanUsername,
        team_id: teamId || null,
      })

    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }

    router.replace('/')
  }

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{
          background: 'var(--page-background)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="text-[13px] text-secondary-theme">
          Loading...
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background: 'var(--page-background)',
        color: 'var(--text-primary)',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[520px] border p-6 sm:p-8"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="mb-7">
          <h1 className="text-[22px] font-bold text-primary-theme">
            Create your SNYT profile
          </h1>

          <p className="mt-1.5 text-[12px] text-secondary-theme">
            Choose your username and team.
          </p>
        </div>

        <label
          htmlFor="username"
          className="block text-[12px] font-semibold text-primary-theme"
        >
          Username
        </label>

        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          minLength={3}
          maxLength={30}
          required
          placeholder="Enter username"
          className="mt-2 h-10 w-full border bg-[var(--surface-secondary)] px-3 text-[12px] text-primary-theme outline-none placeholder:text-muted-theme focus:border-[var(--accent)]"
          style={{
            borderColor: 'var(--border)',
          }}
        />

        <div className="mt-7">
          <TeamPicker
            teams={teams}
            value={teamId}
            onChange={setTeamId}
          />
        </div>

        {error && (
          <div className="mt-5 border border-red-300 bg-red-50 px-3 py-2.5 text-[12px] text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-7 h-10 w-full bg-[var(--accent)] px-4 text-[12px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </form>
    </main>
  )
}