'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitAttendance(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const groupId = formData.get('groupId') as string
  const meetingDate = formData.get('meetingDate') as string
  const attendeeIds = formData.getAll('attendeeIds') as string[]

  // Verify that the user is the leader of this group
  const { data: group } = await supabase
    .from('discipleship_groups')
    .select('*')
    .eq('id', groupId)
    .eq('leader_id', user.id)
    .single()

  if (!group) {
    throw new Error('Unauthorized: You can only record attendance for your own group')
  }

  // Get all members of the group
  const { data: allMembers } = await supabase
    .from('members')
    .select('id')
    .eq('group_id', groupId)

  if (!allMembers) {
    throw new Error('Failed to fetch group members')
  }

  // Create attendance records for all members
  const attendanceRecords = allMembers.map(member => ({
    member_id: member.id,
    meeting_date: meetingDate,
    present: attendeeIds.includes(member.id)
  }))

  // Delete existing records for this date (if any) and insert new ones
  await supabase
    .from('attendance_records')
    .delete()
    .eq('meeting_date', meetingDate)
    .in('member_id', allMembers.map(m => m.id))

  const { error } = await supabase
    .from('attendance_records')
    .insert(attendanceRecords)

  if (error) {
    console.error('Error recording attendance:', error)
    throw new Error('Failed to record attendance')
  }
}