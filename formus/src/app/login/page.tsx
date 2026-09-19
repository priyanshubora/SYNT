'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    
    const redirectTo = `${window.location.origin}/auth/callback?next=/`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (error) {
      console.error(error)
      alert(error.message)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 p-8">
        <h1 className="text-3xl font-bold">
          FORMUS
        </h1>

        <p className="mt-2 text-neutral-400">
          Sign in to participate in discussions.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-8 w-full rounded-lg bg-white px-4 py-3 font-medium text-black"
        >
          Continue with Google
        </button>
      </div>
    </main>
  )
}