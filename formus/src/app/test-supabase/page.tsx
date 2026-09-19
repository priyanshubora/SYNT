import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <h1 className="text-3xl font-bold">
        FORMUS Database Test
      </h1>

      {error ? (
        <div className="mt-6 rounded-lg border border-red-500 p-4">
          <h2 className="font-bold text-red-400">
            Database Error
          </h2>

          <pre className="mt-2 whitespace-pre-wrap text-red-300">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">
            Categories
          </h2>

          <div className="mt-4 space-y-3">
            {categories?.map((category) => (
              <div
                key={category.id}
                className="rounded-lg border border-neutral-800 p-4"
              >
                <p className="font-semibold">
                  {category.name}
                </p>

                <p className="text-sm text-neutral-400">
                  {category.slug}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}