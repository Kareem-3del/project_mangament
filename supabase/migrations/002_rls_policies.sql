-- Enable Row Level Security on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company"
    ON companies FOR SELECT
    USING (
        id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert companies"
    ON companies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update their company"
    ON companies FOR UPDATE
    USING (
        id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete their company"
    ON companies FOR DELETE
    USING (
        id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users policies
CREATE POLICY "Users can view users in their company"
    ON users FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
            AND company_id = users.company_id
        )
    );

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "Admins can update users in their company"
    ON users FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Projects policies
CREATE POLICY "Users can view projects in their company"
    ON projects FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM users WHERE id = auth.uid()
        )
        OR
        id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins and PMs can create projects"
    ON projects FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND company_id = projects.company_id
            AND role IN ('admin', 'project_manager')
        )
    );

CREATE POLICY "Admins and PMs can update projects"
    ON projects FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'project_manager')
        )
        OR
        id IN (
            SELECT project_id FROM project_members
            WHERE user_id = auth.uid() AND role = 'manager'
        )
    );

CREATE POLICY "Admins can delete projects"
    ON projects FOR DELETE
    USING (
        company_id IN (
            SELECT company_id FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Project members policies
CREATE POLICY "Users can view project members for accessible projects"
    ON project_members FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects
            WHERE company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Project managers can add members"
    ON project_members FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_members
            WHERE user_id = auth.uid() AND role = 'manager'
        )
        OR
        project_id IN (
            SELECT id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'project_manager')
        )
    );

CREATE POLICY "Project managers can remove members"
    ON project_members FOR DELETE
    USING (
        project_id IN (
            SELECT project_id FROM project_members
            WHERE user_id = auth.uid() AND role = 'manager'
        )
        OR
        project_id IN (
            SELECT id FROM projects p
            JOIN users u ON p.company_id = u.company_id
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'project_manager')
        )
    );

-- Tickets policies
CREATE POLICY "Users can view tickets in accessible projects"
    ON tickets FOR SELECT
    USING (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
        OR
        project_id IN (
            SELECT id FROM projects
            WHERE company_id IN (
                SELECT company_id FROM users
                WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
            )
        )
    );

CREATE POLICY "Users can create tickets in accessible projects"
    ON tickets FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tickets they created or are assigned to"
    ON tickets FOR UPDATE
    USING (
        created_by = auth.uid()
        OR assigned_to = auth.uid()
        OR project_id IN (
            SELECT project_id FROM project_members
            WHERE user_id = auth.uid() AND role = 'manager'
        )
        OR project_id IN (
            SELECT id FROM projects
            WHERE company_id IN (
                SELECT company_id FROM users
                WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
            )
        )
    );

CREATE POLICY "Admins and PMs can delete tickets"
    ON tickets FOR DELETE
    USING (
        project_id IN (
            SELECT id FROM projects
            WHERE company_id IN (
                SELECT company_id FROM users
                WHERE id = auth.uid() AND role IN ('admin', 'project_manager')
            )
        )
    );

-- Ticket comments policies
CREATE POLICY "Users can view comments on accessible tickets"
    ON ticket_comments FOR SELECT
    USING (
        ticket_id IN (
            SELECT id FROM tickets
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create comments on accessible tickets"
    ON ticket_comments FOR INSERT
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM tickets
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own comments"
    ON ticket_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
    ON ticket_comments FOR DELETE
    USING (user_id = auth.uid());

-- Ticket attachments policies
CREATE POLICY "Users can view attachments on accessible tickets"
    ON ticket_attachments FOR SELECT
    USING (
        ticket_id IN (
            SELECT id FROM tickets
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can upload attachments to accessible tickets"
    ON ticket_attachments FOR INSERT
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM tickets
            WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete their own attachments"
    ON ticket_attachments FOR DELETE
    USING (user_id = auth.uid());

-- Time entries policies
CREATE POLICY "Users can view their own time entries"
    ON time_entries FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins and PMs can view team time entries"
    ON time_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'project_manager')
            AND company_id IN (
                SELECT company_id FROM users WHERE id = time_entries.user_id
            )
        )
    );

CREATE POLICY "Users can create their own time entries"
    ON time_entries FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own time entries"
    ON time_entries FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own time entries"
    ON time_entries FOR DELETE
    USING (user_id = auth.uid());

-- Activity logs policies
CREATE POLICY "Users can view activity in their company"
    ON activity_logs FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users
            WHERE company_id IN (
                SELECT company_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (user_id = auth.uid());
