'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Team = {
  id: string
  name: string
  category_id: string
}

export default function SetupProfilePage() {
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [teamId, setTeamId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadTeams = async () => {
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
        .select('id, name, category_id')
        .order('name')

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      setTeams(data ?? [])
      setLoading(false)
    }

    loadTeams()
  }, [router])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    setError('')
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
        username: username.trim(),
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
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-neutral-800 p-8"
      >
        <h1 className="text-3xl font-bold">
          Create your FORMUS profile
        </h1>

        <p className="mt-2 text-neutral-400">
          Choose your username and team flair.
        </p>

        <label className="mt-8 block text-sm">
          Username
        </label>

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          minLength={3}
          maxLength={30}
          required
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 outline-none"
          placeholder="Enter username"
        />

        <label className="mt-6 block text-sm">
          Team flair
        </label>

        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3"
        >
          <option value="">No team selected</option>

          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-4 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          disabled={saving}
          className="mt-8 w-full rounded-lg bg-white px-4 py-3 font-semibold text-black disabled:opacity-50"
        >
          {saving ? 'Creating profile...' : 'Complete Profile'}
        </button>
      </form>
    </main>
  )
}