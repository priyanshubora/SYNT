'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function getSiteUrl() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`
  }

  return 'http://localhost:3000'
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setLoading(true)

    const supabase = createClient()

    const next =
      new URLSearchParams(window.location.search).get('next') || '/'

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    })

    if (error) {
      console.error('Google login failed:', error)
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-5 dark:bg-[#1A1A1A]">
      <div className="w-full max-w-[420px]">
        {/* BRAND */}
        <div className="mb-7 text-center">
          <div className="mb-3 flex justify-center">
            <img
              src="/snytlogoheadbar.png"
              alt="SNYT logo"
              className="h-14 w-auto object-contain drop-shadow-[0_8px_22px_rgba(15,23,42,0.12)]"
            />
          </div>

          <h1 className="text-[22px] font-bold tracking-tight text-[#172033] dark:text-white">
            Welcome to SNYT
          </h1>

          <p className="mt-2 text-[12px] leading-5 text-[#7b8798] dark:text-[#9a9a9a]">
            The community for esports, gaming and everything in between.
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="rounded-[18px] border border-[#e1e6ed] bg-white p-7 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-[#333] dark:bg-[#222] dark:shadow-none">
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#172033] dark:text-white">
              Sign in
            </h2>

            <p className="mt-1 text-[11px] text-[#8993a3] dark:text-[#999]">
              Join the conversation and start posting.
            </p>
          </div>

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#dfe4ea] bg-white text-[13px] font-semibold text-[#202124] transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[#444] dark:bg-[#292929] dark:text-white dark:hover:bg-[#303030]"
          >
            {/* GOOGLE LOGO */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="#4285F4"
                d="M21.35 12.23c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.21 2.91-7.42z"
              />
              <path
                fill="#34A853"
                d="M12 21.6c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.6z"
              />
              <path
                fill="#FBBC05"
                d="M6.54 13.69A5.86 5.86 0 0 1 6.23 12c0-.59.1-1.17.31-1.69V7.79H3.3A9.6 9.6 0 0 0 2.27 12c0 1.52.36 2.95 1.03 4.21l3.24-2.52z"
              />
              <path
                fill="#EA4335"
                d="M12 6.28c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52C7.31 8 9.46 6.28 12 6.28z"
              />
            </svg>

            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#e8ebef] dark:bg-[#3a3a3a]" />
            <span className="text-[9px] uppercase tracking-wider text-[#a0a8b4]">
              SNYT
            </span>
            <div className="h-px flex-1 bg-[#e8ebef] dark:bg-[#3a3a3a]" />
          </div>

          <div className="rounded-[10px] bg-[#f7f9fc] px-4 py-3 dark:bg-[#292929]">
            <p className="text-center text-[10px] leading-4 text-[#8993a3] dark:text-[#999]">
              New here? After signing in, you will be able to choose your
              username and team flair.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="mt-6 text-center text-[9px] leading-4 text-[#a0a8b4] dark:text-[#777]">
          By continuing, you agree to participate respectfully in the
          SNYT community.
        </p>
      </div>
    </main>
  )
}