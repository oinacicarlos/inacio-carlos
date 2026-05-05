import { Suspense } from 'react'
import { supabase, type Post } from '@/src/lib/supabaseClient'
import NewPostForm from '@/app/components/NewPostForm'

async function PostList() {
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <p className="text-sm text-red-500">Failed to load posts: {error.message}</p>
    )
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 py-12 text-center dark:border-zinc-700">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No posts yet. Be the first to publish one!
        </p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-4">
      {(posts as Post[]).map((post) => (
        <li
          key={post.id}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {post.title}
            </h2>
            <time className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
              {new Date(post.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </div>
          {post.content && (
            <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.content}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function PostListSkeleton() {
  return (
    <ul className="flex flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-3 h-3 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-zinc-100 dark:bg-zinc-800" />
        </li>
      ))}
    </ul>
  )
}

export default function PostsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Posts
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Share your thoughts with the world.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <NewPostForm />

          <section>
            <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              Latest
            </h2>
            <Suspense fallback={<PostListSkeleton />}>
              <PostList />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  )
}
