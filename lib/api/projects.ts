import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/supabase/database.types'

type Project = Database['public']['Tables']['projects']['Row']
type ProjectInsert = Database['public']['Tables']['projects']['Insert']
type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export async function getProjects() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, created_by:users!projects_created_by_fkey(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProjectById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, created_by:users!projects_created_by_fkey(full_name, email)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createProject(project: ProjectInsert) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProject(id: string, updates: ProjectUpdate) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProject(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) throw error
}

export async function getProjectMembers(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .select('*, user:users(*)')
    .eq('project_id', projectId)

  if (error) throw error
  return data
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: 'manager' | 'member' | 'viewer'
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_members')
    .insert({ project_id: projectId, user_id: userId, role })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeProjectMember(projectId: string, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('project_id', projectId)
    .eq('user_id', userId)

  if (error) throw error
}
