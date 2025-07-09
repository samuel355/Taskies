export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          first_name: string
          last_name: string
          avatar: string | null
          is_active: boolean
          role: 'admin' | 'manager' | 'member'
          phone: string | null
          timezone: string | null
          language: string | null
          last_login: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          first_name: string
          last_name: string
          avatar?: string | null
          is_active?: boolean
          role?: 'admin' | 'manager' | 'member'
          phone?: string | null
          timezone?: string | null
          language?: string | null
          last_login?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar?: string | null
          is_active?: boolean
          role?: 'admin' | 'manager' | 'member'
          phone?: string | null
          timezone?: string | null
          language?: string | null
          last_login?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          color: string
          icon: string
          owner_id: string
          deadline: string | null
          status: 'active' | 'completed' | 'on-hold' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          progress: number
          budget: number | null
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          color: string
          icon: string
          owner_id: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'on-hold' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          progress?: number
          budget?: number | null
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          color?: string
          icon?: string
          owner_id?: string
          deadline?: string | null
          status?: 'active' | 'completed' | 'on-hold' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          progress?: number
          budget?: number | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      project_members: {
        Row: {
          id: string
          created_at: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member'
          joined_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          project_id: string
          assignee_id: string | null
          assigned_by_id: string
          status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          completed_at: string | null
          estimated_hours: number | null
          actual_hours: number | null
          progress: number
          tags: string[]
          dependencies: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          project_id: string
          assignee_id?: string | null
          assigned_by_id: string
          status?: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress?: number
          tags?: string[]
          dependencies?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          project_id?: string
          assignee_id?: string | null
          assigned_by_id?: string
          status?: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          progress?: number
          tags?: string[]
          dependencies?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_id_fkey"
            columns: ["assigned_by_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      task_comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          task_id: string
          user_id: string
          content: string
          edited_at: string | null
          mentions: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id: string
          user_id: string
          content: string
          edited_at?: string | null
          mentions?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id?: string
          user_id?: string
          content?: string
          edited_at?: string | null
          mentions?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      task_attachments: {
        Row: {
          id: string
          created_at: string
          task_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          thumbnail_path: string | null
          uploaded_by: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          task_id: string
          file_name: string
          file_type: string
          file_size: number
          file_path: string
          thumbnail_path?: string | null
          uploaded_by: string
          uploaded_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          task_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          file_path?: string
          thumbnail_path?: string | null
          uploaded_by?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      subtasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          task_id: string
          title: string
          completed: boolean
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id: string
          title: string
          completed?: boolean
          order_index: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          task_id?: string
          title?: string
          completed?: boolean
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          }
        ]
      }
      task_labels: {
        Row: {
          id: string
          created_at: string
          project_id: string
          name: string
          color: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          project_id: string
          name: string
          color: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          project_id?: string
          name?: string
          color?: string
          description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_labels_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      task_label_assignments: {
        Row: {
          id: string
          created_at: string
          task_id: string
          label_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          task_id: string
          label_id: string
        }
        Update: {
          id?: string
          created_at?: string
          task_id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_label_assignments_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_label_assignments_label_id_fkey"
            columns: ["label_id"]
            referencedRelation: "task_labels"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'task_due' | 'comment_added' | 'mention' | 'project_update'
          title: string
          message: string
          is_read: boolean
          data: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: 'task_assigned' | 'task_completed' | 'task_due' | 'comment_added' | 'mention' | 'project_update'
          title: string
          message: string
          is_read?: boolean
          data?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: 'task_assigned' | 'task_completed' | 'task_due' | 'comment_added' | 'mention' | 'project_update'
          title?: string
          message?: string
          is_read?: boolean
          data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          theme: 'light' | 'dark' | 'system'
          language: string
          timezone: string
          notifications: Json
          privacy: Json
          preferences: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          notifications?: Json
          privacy?: Json
          preferences?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          theme?: 'light' | 'dark' | 'system'
          language?: string
          timezone?: string
          notifications?: Json
          privacy?: Json
          preferences?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added'
          title: string
          description: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added'
          title: string
          description: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added'
          title?: string
          description?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'admin' | 'manager' | 'member'
      project_status: 'active' | 'completed' | 'on-hold' | 'cancelled'
      task_status: 'todo' | 'in-progress' | 'review' | 'completed' | 'cancelled'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
      project_member_role: 'owner' | 'admin' | 'member'
      notification_type: 'task_assigned' | 'task_completed' | 'task_due' | 'comment_added' | 'mention' | 'project_update'
      activity_type: 'task_created' | 'task_completed' | 'task_assigned' | 'project_created' | 'comment_added'
      theme_type: 'light' | 'dark' | 'system'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
