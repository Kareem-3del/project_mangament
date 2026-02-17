import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketInsert = Database['public']['Tables']['tickets']['Insert']
type TicketUpdate = Database['public']['Tables']['tickets']['Update']

export async function getTickets(projectId?: string) {
  const supabase = createClient()
  let query = supabase
    .from('tickets')
    .select(`
      *,
      assigned_to:users!tickets_assigned_to_fkey(full_name, email, avatar_url),
      created_by:users!tickets_created_by_fkey(full_name, email),
      project:projects(name)
    `)
    .order('created_at', { ascending: false })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMyTickets(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      assigned_to:users!tickets_assigned_to_fkey(full_name, email, avatar_url),
      created_by:users!tickets_created_by_fkey(full_name, email),
      project:projects(name)
    `)
    .eq('assigned_to', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getTicketById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      assigned_to:users!tickets_assigned_to_fkey(full_name, email, avatar_url),
      created_by:users!tickets_created_by_fkey(full_name, email),
      project:projects(name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createTicket(ticket: TicketInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    // @ts-ignore - Supabase type inference issue
    .insert(ticket)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTicket(id: string, updates: TicketUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tickets')
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTicket(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('tickets').delete().eq('id', id)

  if (error) throw error
}

export async function getTicketComments(ticketId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ticket_comments')
    .select('*, user:users(full_name, email, avatar_url)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createComment(ticketId: string, content: string, userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ticket_comments')
    // @ts-ignore - Supabase type inference issue
    .insert({ ticket_id: ticketId, content, user_id: userId })
    .select('*, user:users(full_name, email, avatar_url)')
    .single()

  if (error) throw error
  return data
}

export async function getTicketAttachments(ticketId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ticket_attachments')
    .select('*, user:users(full_name, email)')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
