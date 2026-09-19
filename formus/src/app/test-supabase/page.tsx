import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-3xl font-bold">
        FORMUS Auth Test
      </h1>

      <div className="mt-6 rounded-lg border border-neutral-800 p-6">
        {user ? (
          <>
            <p className="text-green-400">
              Authenticated
            </p>

            <p className="mt-2">
              Email: {user.email}
            </p>

            <p className="mt-2">
              User ID: {user.id}
            </p>
          </>
        ) : (
          <p className="text-red-400">
            Not authenticated
          </p>
        )}
      </div>
    </main>
  )
}