-- Versions before V11 sent UTC clock values into LocalDateTime columns.
-- Move existing focus records to Asia/Shanghai wall-clock time once; new clients send local values directly.
update potato_sessions
set started_at = date_add(started_at, interval 8 hour),
    ended_at = date_add(ended_at, interval 8 hour);
