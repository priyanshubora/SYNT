'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postComment(threadId: string, content: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) {
    throw new Error('Profile not set up')
  }

  const { error } = await supabase
    .from('comments')
    .insert({
      thread_id: threadId,
      author_id: user.id,
      content: content.trim(),
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/thread/${threadId}`)
}
