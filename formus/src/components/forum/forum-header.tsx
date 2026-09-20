'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import NotificationBell from '@/components/forum/notification-bell'
import { createClient } from '@/lib/supabase/client'

export default function ForumHeader() {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)
  const [username, setUsername] = useState('User')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const isHomeActive = pathname === '/'
  const isForumsActive =
    pathname?.startsWith('/category') ||
    pathname?.startsWith('/thread') ||
    pathname?.startsWith('/new')
  const isRulesActive = pathname === '/rules'
  const isAboutActive = pathname === '/about'

  useEffect(() => {
    const savedTheme = localStorage.getItem('snyt-theme')

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    }

    async function loadUser() {
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
    }

    loadUser()
  }, [])

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
    <header className="forum-header h-[46px] border-b bg-black text-white">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-4">
        {/* LEFT */}
        <div className="flex h-full items-center gap-8">
          <Link
            href="/"
            className="flex h-full items-center"
          >
            <img
              src="/snytlogoheadbar.png"
              alt="SNYT"
              className="h-[45px] w-auto object-contain"
            />
          </Link>

          <nav className="flex h-full items-center gap-6 text-[12px] font-medium">
            <Link
              href="/"
              className={`relative flex h-full items-center transition-opacity ${
                isHomeActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              Home

              {isHomeActive ? (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2877ff]" />
              ) : null}
            </Link>

            <Link
              href="/category/offtopic"
              className={`relative flex h-full items-center transition-opacity ${
                isForumsActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              Forums

              {isForumsActive ? (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2877ff]" />
              ) : null}
            </Link>

            <Link
              href="/rules"
              className={`relative flex h-full items-center transition-opacity ${
                isRulesActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              Rules

              {isRulesActive ? (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2877ff]" />
              ) : null}
            </Link>

            <Link
              href="/about"
              className={`relative flex h-full items-center transition-opacity ${
                isAboutActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
              }`}
            >
              About

              {isAboutActive ? (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2877ff]" />
              ) : null}
            </Link>
          </nav>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">
          {/* NOTIFICATIONS */}
          <NotificationBell />

          {/* THEME */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={
              darkMode
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#286cff] text-[17px] transition hover:bg-[#286cff] hover:text-white"
          >
            {darkMode ? '☀' : '☾'}
          </button>

          {/* PROFILE */}
          <Link
            href="/profile"
            className="flex items-center gap-2"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#26303d] text-[11px] text-white">
                {username.charAt(0).toUpperCase()}
              </span>
            )}

            <span className="hidden max-w-[100px] truncate text-[12px] font-semibold sm:block">
              {username}
            </span>

            <span className="text-[10px] opacity-50">
              ▼
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}