'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addMember(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const groupId = formData.get('groupId') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  // Verify that the user is the leader of this group
  const { data: group } = await supabase
    .from('discipleship_groups')
    .select('*')
    .eq('id', groupId)
    .eq('leader_id', user.id)
    .single()

  if (!group) {
    throw new Error('Unauthorized: You can only add members to your own group')
  }

  const { error } = await supabase
    .from('members')
    .insert({
      group_id: groupId,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null
    })

  if (error) {
    console.error('Error adding member:', error)
    throw new Error('Failed to add member')
  }

  revalidatePath('/')
}