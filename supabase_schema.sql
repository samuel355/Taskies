-- Supabase SQL schema for Taskies

-- Enums
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');
CREATE TYPE project_status AS ENUM ('active', 'completed', 'on-hold', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE project_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE notification_type AS ENUM ('task_assigned', 'task_completed', 'task_due', 'comment_added', 'mention', 'project_update');
CREATE TYPE activity_type AS ENUM ('task_created', 'task_completed', 'task_assigned', 'project_created', 'comment_added');
CREATE TYPE theme_type AS ENUM ('light', 'dark', 'system');

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar text,
  is_active boolean NOT NULL DEFAULT true,
  role user_role NOT NULL DEFAULT 'member',
  phone text,
  timezone text,
  language text,
  last_login timestamptz
);

-- Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  description text NOT NULL,
  color text NOT NULL,
  icon text NOT NULL,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deadline timestamptz,
  status project_status NOT NULL DEFAULT 'active',
  priority priority_level NOT NULL DEFAULT 'medium',
  progress integer NOT NULL DEFAULT 0,
  budget numeric,
  tags text[]
);

-- Project Members table
CREATE TABLE project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role project_member_role NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assignee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  assigned_by_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status task_status NOT NULL DEFAULT 'todo',
  priority priority_level NOT NULL DEFAULT 'medium',
  due_date timestamptz,
  completed_at timestamptz,
  estimated_hours numeric,
  actual_hours numeric,
  progress integer NOT NULL DEFAULT 0,
  tags text[],
  dependencies uuid[]
);

-- Task Comments table
CREATE TABLE task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  edited_at timestamptz,
  mentions uuid[]
);

-- Task Attachments table
CREATE TABLE task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  file_path text NOT NULL,
  thumbnail_path text,
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- Subtasks table
CREATE TABLE subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL
);

-- Task Labels table
CREATE TABLE task_labels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  description text
);

-- Task Label Assignments table
CREATE TABLE task_label_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  label_id uuid NOT NULL REFERENCES task_labels(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  data jsonb
);

-- User Settings table
CREATE TABLE user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme theme_type NOT NULL DEFAULT 'system',
  language text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'UTC',
  notifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- Activities table
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  metadata jsonb
); 