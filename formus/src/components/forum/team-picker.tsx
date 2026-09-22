'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

export type TeamPickerTeam = {
  id: string
  name: string
  logo_url: string | null
  region: 'indian' | 'international'
}

type TeamPickerProps = {
  teams: TeamPickerTeam[]
  value: string | null
  onChange: (teamId: string | null) => void
}

export default function TeamPicker({
  teams,
  value,
  onChange,
}: TeamPickerProps) {
  const [region, setRegion] = useState<'indian' | 'international'>(
    'indian',
  )
  const [search, setSearch] = useState('')

  const filteredTeams = useMemo(() => {
    const query = search.trim().toLowerCase()

    return teams
      .filter((team) => team.region === region)
      .filter((team) => {
        if (!query) return true

        return team.name.toLowerCase().includes(query)
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [teams, region, search])

  const selectedTeam = teams.find((team) => team.id === value)

  return (
    <div className="w-full">
      <div className="mb-3 text-[12px] font-semibold text-primary-theme">
        Choose Team
      </div>

      <div className="mb-3 grid grid-cols-2 border border-[var(--border)]">
        <button
          type="button"
          onClick={() => {
            setRegion('indian')
            setSearch('')
          }}
          className={`flex items-center justify-center gap-2 border-r border-[var(--border)] px-3 py-2.5 text-[12px] font-semibold transition ${
            region === 'indian'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--surface)] text-secondary-theme hover:bg-[var(--surface-secondary)]'
          }`}
        >
          <span>🇮🇳</span>
          Indian
        </button>

        <button
          type="button"
          onClick={() => {
            setRegion('international')
            setSearch('')
          }}
          className={`flex items-center justify-center gap-2 px-3 py-2.5 text-[12px] font-semibold transition ${
            region === 'international'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--surface)] text-secondary-theme hover:bg-[var(--surface-secondary)]'
          }`}
        >
          <span>🌎</span>
          International
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={`Search ${
          region === 'indian' ? 'Indian' : 'International'
        } teams...`}
        className="mb-3 h-9 w-full border border-[var(--border)] bg-[var(--surface-secondary)] px-3 text-[12px] text-primary-theme outline-none placeholder:text-muted-theme focus:border-[var(--accent)]"
      />

      <div className="max-h-[300px] overflow-y-auto border border-[var(--border)]">
        {filteredTeams.length === 0 ? (
          <div className="px-4 py-8 text-center text-[12px] text-muted-theme">
            No teams found.
          </div>
        ) : (
          filteredTeams.map((team) => {
            const selected = team.id === value

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => onChange(selected ? null : team.id)}
                className={`flex w-full items-center gap-3 border-b border-[var(--border)] px-3 py-2.5 text-left last:border-b-0 transition ${
                  selected
                    ? 'bg-[var(--accent-soft)]'
                    : 'bg-[var(--surface)] hover:bg-[var(--surface-secondary)]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {team.logo_url ? (
                    <Image
                      src={team.logo_url}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center border border-[var(--border)] text-[10px] text-muted-theme">
                      ?
                    </div>
                  )}
                </div>

                <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-primary-theme">
                  {team.name}
                </span>

                {selected && (
                  <span className="text-[11px] font-semibold text-[var(--accent)]">
                    ✓
                  </span>
                )}
              </button>
            )
          })
        )}
      </div>

      {selectedTeam && (
        <div className="mt-2 text-[11px] text-secondary-theme">
          Selected: <span className="font-semibold">{selectedTeam.name}</span>
        </div>
      )}
    </div>
  )
}