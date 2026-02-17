import { UserRole } from '../supabase/database.types'

export const ROLE_PERMISSIONS = {
  admin: [
    'company.manage',
    'users.manage',
    'projects.create',
    'projects.update',
    'projects.delete',
    'projects.view',
    'tickets.create',
    'tickets.update',
    'tickets.delete',
    'tickets.view',
    'time.view_all',
    'reports.view',
  ],
  project_manager: [
    'projects.create',
    'projects.update',
    'projects.view',
    'tickets.create',
    'tickets.update',
    'tickets.delete',
    'tickets.view',
    'time.view_all',
    'reports.view',
  ],
  team_member: [
    'projects.view',
    'tickets.create',
    'tickets.update',
    'tickets.view',
    'time.manage',
  ],
  client: ['projects.view', 'tickets.view'],
} as const

export function hasPermission(userRole: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole]
  return permissions.includes(permission as any)
}

export function canManageCompany(userRole: UserRole): boolean {
  return hasPermission(userRole, 'company.manage')
}

export function canManageUsers(userRole: UserRole): boolean {
  return hasPermission(userRole, 'users.manage')
}

export function canCreateProject(userRole: UserRole): boolean {
  return hasPermission(userRole, 'projects.create')
}

export function canDeleteProject(userRole: UserRole): boolean {
  return hasPermission(userRole, 'projects.delete')
}

export function canViewAllTimeEntries(userRole: UserRole): boolean {
  return hasPermission(userRole, 'time.view_all')
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin'
}

export function isProjectManager(userRole: UserRole): boolean {
  return userRole === 'project_manager'
}

export function isTeamMember(userRole: UserRole): boolean {
  return userRole === 'team_member'
}

export function isClient(userRole: UserRole): boolean {
  return userRole === 'client'
}
