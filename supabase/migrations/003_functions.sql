-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            TG_OP || ' ' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            TG_OP || ' ' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            NEW.id,
            jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata)
        VALUES (
            auth.uid(),
            TG_OP || ' ' || TG_TABLE_NAME,
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create activity logging triggers
CREATE TRIGGER log_project_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_ticket_activity
    AFTER INSERT OR UPDATE OR DELETE ON tickets
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_ticket_comment_activity
    AFTER INSERT OR UPDATE OR DELETE ON ticket_comments
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Function to auto-checkout after 12 hours
CREATE OR REPLACE FUNCTION auto_checkout_time_entries()
RETURNS void AS $$
BEGIN
    UPDATE time_entries
    SET check_out = check_in + INTERVAL '12 hours'
    WHERE check_out IS NULL
    AND check_in < NOW() - INTERVAL '12 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to get user's active time entry
CREATE OR REPLACE FUNCTION get_active_time_entry(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    ticket_id UUID,
    check_in TIMESTAMP WITH TIME ZONE,
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.id,
        te.project_id,
        te.ticket_id,
        te.check_in,
        te.notes
    FROM time_entries te
    WHERE te.user_id = p_user_id
    AND te.check_out IS NULL
    ORDER BY te.check_in DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate project hours
CREATE OR REPLACE FUNCTION get_project_hours(p_project_id UUID)
RETURNS TABLE (
    total_hours NUMERIC,
    billable_hours NUMERIC,
    non_billable_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(duration_minutes) / 60.0, 0) as total_hours,
        COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END) / 60.0, 0) as billable_hours,
        COALESCE(SUM(CASE WHEN NOT is_billable THEN duration_minutes ELSE 0 END) / 60.0, 0) as non_billable_hours
    FROM time_entries
    WHERE project_id = p_project_id
    AND check_out IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID, p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    total_hours NUMERIC,
    total_tickets_completed INTEGER,
    total_comments INTEGER,
    active_tickets INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(te.duration_minutes) / 60.0, 0) as total_hours,
        COALESCE(COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END), 0)::INTEGER as total_tickets_completed,
        COALESCE(COUNT(DISTINCT tc.id), 0)::INTEGER as total_comments,
        COALESCE(COUNT(DISTINCT CASE WHEN t.status IN ('todo', 'in_progress', 'in_review') THEN t.id END), 0)::INTEGER as active_tickets
    FROM users u
    LEFT JOIN time_entries te ON u.id = te.user_id
        AND te.check_in >= p_start_date
        AND te.check_in <= p_end_date + INTERVAL '1 day'
    LEFT JOIN tickets t ON u.id = t.assigned_to
    LEFT JOIN ticket_comments tc ON u.id = tc.user_id
        AND tc.created_at >= p_start_date
        AND tc.created_at <= p_end_date + INTERVAL '1 day'
    WHERE u.id = p_user_id
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
