import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type ForumShellProps = {
  children: React.ReactNode
}

export default async function ForumShell({
  children,
}: ForumShellProps) {
  const supabase = await createClient()

  const [
    { data: categories },
    {
      data: { user },
    },
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name'),

    supabase.auth.getUser(),
  ])

  let profile:
    | {
        username: string
        team: { name: string } | null
      }
    | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, team:teams(name)')
      .eq('id', user.id)
      .maybeSingle()

    profile = data
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            FORMUS
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/new"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Create Thread
            </Link>

            {user && profile ? (
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">
                  {profile.username}
                </p>

                {profile.team && (
                  <p className="text-xs text-neutral-400">
                    {profile.team.name}
                  </p>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-neutral-300 hover:text-white"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden min-h-[calc(100vh-73px)] w-56 shrink-0 border-r border-neutral-800 p-5 md:block">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Communities
          </p>

          <nav className="space-y-1">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
            >
              Home
            </Link>

            {categories?.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="block rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  )
}