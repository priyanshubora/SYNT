'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import NotificationBell from '@/components/forum/notification-bell'
import { createClient } from '@/lib/supabase/client'

export default function ForumHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return localStorage.getItem('snyt-theme') === 'dark'
  })
  const [username, setUsername] = useState('User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const isForumsActive =
    pathname?.startsWith('/category') ||
    pathname?.startsWith('/thread') ||
    pathname?.startsWith('/new')
  const isRulesActive = pathname === '/rules'
  const isAboutActive = pathname === '/about'

  const loadUser = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    if (profile?.username) {
      setUsername(profile.username)
    } else {
      setUsername(
        user.user_metadata?.user_name ??
          user.email?.split('@')[0] ??
          'User',
      )
    }

    setAvatarUrl(
      user.user_metadata?.avatar_url ??
        user.user_metadata?.picture ??
        null,
    )
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadUser()
  }, [loadUser])

  function toggleTheme() {
    const newDarkMode = !darkMode

    setDarkMode(newDarkMode)

    if (newDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('snyt-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('snyt-theme', 'light')
    }
  }

  return (
    <header className="forum-header border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex h-[56px] max-w-[1400px] items-center justify-between px-3 sm:px-4">
        {/* LEFT */}
        <div className="flex h-full items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="flex h-full items-center pr-2"
          >
            <Image
              src="/snytlogoheadbar.png"
              alt="SNYT"
              width={120}
              height={44}
              className="h-[38px] w-auto object-contain sm:h-[42px] md:h-[44px]"
              priority
            />
          </Link>

          <nav className="flex h-full items-center">
            <Link
              href="/category/offtopic"
              prefetch={true}
              className={`relative flex h-full items-center px-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${
                isForumsActive
                  ? 'text-[#f2f7f0]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Forums</span>
              {isForumsActive ? (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#74A662]" />
              ) : null}
            </Link>

            <span className="h-5 w-px bg-white/15" aria-hidden="true" />

            <Link
              href="/rules"
              prefetch={true}
              className={`relative flex h-full items-center px-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${
                isRulesActive
                  ? 'text-[#f2f7f0]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>Rules</span>
              {isRulesActive ? (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#74A662]" />
              ) : null}
            </Link>

            <span className="h-5 w-px bg-white/15" aria-hidden="true" />

            <Link
              href="/about"
              prefetch={true}
              className={`relative flex h-full items-center px-3 text-[11px] font-bold uppercase tracking-[0.18em] transition-all ${
                isAboutActive
                  ? 'text-[#f2f7f0]'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span>About</span>
              {isAboutActive ? (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-[#74A662]" />
              ) : null}
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center divide-x divide-white/10 rounded-full border border-white/10 bg-white/[0.02] p-1">
            <NotificationBell />

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              title={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              className="flex h-8 w-8 items-center justify-center text-[15px] text-white/80 transition hover:text-white"
            >
              {darkMode ? '☀' : '☾'}
            </button>
          </div>

          <Link
            href="/profile"
            prefetch={true}
            onMouseEnter={() => router.prefetch('/profile')}
            onFocus={() => router.prefetch('/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] transition hover:border-white/20 hover:bg-white/[0.05]"
            aria-label="Profile"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#74A662]/40 bg-[#74A662]/12 text-[11px] font-bold text-[#dff5d6]">
                {username.charAt(0).toUpperCase()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
