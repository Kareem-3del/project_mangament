import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type TimeEntry = Database['public']['Tables']['time_entries']['Row']
type TimeEntryInsert = Database['public']['Tables']['time_entries']['Insert']

export type TimeEntryWithRelations = TimeEntry & {
  project: { name: string } | null
  ticket: { title: string } | null
}

export async function getActiveTimeEntry(userId: string): Promise<TimeEntryWithRelations | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_entries')
    .select('*, project:projects(name), ticket:tickets(title)')
    .eq('user_id', userId)
    .is('check_out', null)
    .order('check_in', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data as TimeEntryWithRelations | null
}

export async function checkIn(
  userId: string,
  projectId?: string,
  ticketId?: string,
  notes?: string
): Promise<TimeEntryWithRelations> {
  const supabase = createClient()

  // First, check if there's an active entry
  const activeEntry = await getActiveTimeEntry(userId)
  if (activeEntry) {
    throw new Error('You already have an active time entry. Please check out first.')
  }

  const { data, error } = await supabase
    .from('time_entries')
    // @ts-ignore - Supabase type inference issue
    .insert({
      user_id: userId,
      project_id: projectId,
      ticket_id: ticketId,
      notes,
    })
    .select('*, project:projects(name), ticket:tickets(title)')
    .single()

  if (error) throw error
  return data as TimeEntryWithRelations
}

export async function checkOut(entryId: string): Promise<TimeEntryWithRelations> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_entries')
    // @ts-ignore - Supabase type inference issue
    .update({ check_out: new Date().toISOString() })
    .eq('id', entryId)
    .select('*, project:projects(name), ticket:tickets(title)')
    .single()

  if (error) throw error
  return data as TimeEntryWithRelations
}

export async function getTimeEntries(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<TimeEntryWithRelations[]> {
  const supabase = createClient()
  let query = supabase
    .from('time_entries')
    .select('*, project:projects(name), ticket:tickets(title)')
    .eq('user_id', userId)
    .order('check_in', { ascending: false })

  if (startDate) {
    query = query.gte('check_in', startDate.toISOString())
  }

  if (endDate) {
    query = query.lte('check_in', endDate.toISOString())
  }

  const { data, error } = await query
  if (error) throw error
  return (data as TimeEntryWithRelations[]) || []
}

export async function getProjectTimeEntries(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('time_entries')
    .select('*, user:users(full_name, email), ticket:tickets(title)')
    .eq('project_id', projectId)
    .not('check_out', 'is', null)
    .order('check_in', { ascending: false })

  if (error) throw error
  return data
}

export async function deleteTimeEntry(entryId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}
