'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createPost, type PostFormState } from '@/app/posts/actions'

const initialState: PostFormState = {}

export default function NewPostForm() {
  const [state, action, pending] = useActionState(createPost, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state])

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        New Post
      </h2>
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="Post title"
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="content"
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Content
            <span className="ml-1 font-normal text-zinc-400">(optional)</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows={4}
            placeholder="Write something..."
            className="resize-none rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-500">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="self-end rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </div>
  )
}
