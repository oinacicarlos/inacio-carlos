import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Inácio Carlos
        </h1>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          A simple blog powered by Next.js and Supabase.
        </p>
        <Link
          href="/posts"
          className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          View Posts →
        </Link>
      </div>
    </div>
  )
}
