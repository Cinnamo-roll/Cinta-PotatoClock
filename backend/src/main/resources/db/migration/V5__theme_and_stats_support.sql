alter table user_settings
    add column custom_theme_color varchar(20) null after theme_color;

update user_settings
set theme_color = 'rose'
where theme_color is null or theme_color = 'pink' or theme_color = 'potato';

create index idx_potato_sessions_user_task on potato_sessions (user_id, task_id);
create index idx_tasks_user_count_to_stats on tasks (user_id, count_to_stats);
