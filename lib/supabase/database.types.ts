export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'project_manager' | 'team_member' | 'client'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'
export type ProjectMemberRole = 'manager' | 'member' | 'viewer'
export type TicketStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          company_id: string | null
          email: string
          full_name: string
          avatar_url: string | null
          role: UserRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          company_id?: string | null
          email: string
          full_name: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: UserRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          name: string
          description: string | null
          status: ProjectStatus
          start_date: string | null
          end_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          name: string
          description?: string | null
          status?: ProjectStatus
          start_date?: string | null
          end_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          name?: string
          description?: string | null
          status?: ProjectStatus
          start_date?: string | null
          end_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: ProjectMemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: ProjectMemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: ProjectMemberRole
          joined_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: TicketStatus
          priority: TicketPriority
          assigned_to: string | null
          created_by: string
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: TicketStatus
          priority?: TicketPriority
          assigned_to?: string | null
          created_by: string
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: TicketStatus
          priority?: TicketPriority
          assigned_to?: string | null
          created_by?: string
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      ticket_attachments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          file_name: string
          file_url: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          file_name?: string
          file_url?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          ticket_id: string | null
          check_in: string
          check_out: string | null
          duration_minutes: number | null
          notes: string | null
          is_billable: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          ticket_id?: string | null
          check_in?: string
          check_out?: string | null
          notes?: string | null
          is_billable?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          ticket_id?: string | null
          check_in?: string
          check_out?: string | null
          notes?: string | null
          is_billable?: boolean
          created_at?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          entity_type?: string
          entity_id?: string
          metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_active_time_entry: {
        Args: { p_user_id: string }
        Returns: {
          id: string
          project_id: string | null
          ticket_id: string | null
          check_in: string
          notes: string | null
        }[]
      }
      get_project_hours: {
        Args: { p_project_id: string }
        Returns: {
          total_hours: number
          billable_hours: number
          non_billable_hours: number
        }[]
      }
      get_user_stats: {
        Args: {
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: {
          total_hours: number
          total_tickets_completed: number
          total_comments: number
          active_tickets: number
        }[]
      }
    }
    Enums: {
      user_role: UserRole
      project_status: ProjectStatus
      project_member_role: ProjectMemberRole
      ticket_status: TicketStatus
      ticket_priority: TicketPriority
    }
  }
}
