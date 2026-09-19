export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-4xl font-bold tracking-tight">
          FORMUS
        </h1>

        <p className="mt-3 text-neutral-400">
          The esports discussion forum.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">Esports</h2>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">BGMI</h2>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">Valorant</h2>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">Chess</h2>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">Free Fire</h2>
          </div>

          <div className="rounded-xl border border-neutral-800 p-6">
            <h2 className="font-semibold">Off-topic</h2>
          </div>
        </div>
      </div>
    </main>
  )
}