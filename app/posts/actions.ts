'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from '@/src/lib/supabaseClient'

export type PostFormState = { error?: string; success?: boolean }

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()

  if (!title) return { error: 'Title is required' }

  const { error } = await supabase
    .from('posts')
    .insert({ title, content: content || null })

  if (error) return { error: error.message }

  revalidatePath('/posts')
  return { success: true }
}
