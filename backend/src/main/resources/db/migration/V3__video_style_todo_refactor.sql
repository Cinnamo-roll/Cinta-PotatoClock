alter table tasks
    add column habit_frequency varchar(20) null after count_to_stats,
    add column target_amount int null after habit_frequency,
    add column target_unit varchar(50) null after target_amount,
    add column target_deadline date null after target_unit;

alter table tasks
    add index idx_tasks_user_deleted (user_id, deleted),
    add index idx_tasks_timer_type (timer_type);

alter table todo_collections
    add column color varchar(50) not null default 'pink' after description;

alter table potato_sessions
    add column actual_seconds int not null default 0 after actual_minutes;

update potato_sessions
set actual_seconds = actual_minutes * 60
where actual_seconds = 0;

alter table user_settings
    add column focus_motto varchar(200) null after default_duration_minutes,
    add column break_minutes int not null default 5 after focus_motto,
    add column pause_limit_minutes int null after break_minutes,
    add column completion_sound varchar(50) not null default 'default' after pause_limit_minutes,
    add column study_mode_enabled boolean not null default false after completion_sound,
    add column countdown_auto_continue_enabled boolean not null default false after study_mode_enabled;
