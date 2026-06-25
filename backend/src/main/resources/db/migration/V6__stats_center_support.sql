alter table potato_sessions
    add column interrupt_reason varchar(50) null after interrupted;

alter table user_settings
    add column default_stats_range varchar(20) not null default 'day' after custom_theme_color,
    add column week_start_day varchar(20) not null default 'monday' after default_stats_range,
    add column show_month_stats boolean not null default true after week_start_day,
    add column show_interruption_reasons boolean not null default true after show_month_stats,
    add column show_task_ranking boolean not null default true after show_interruption_reasons;

create index idx_potato_sessions_user_interruption_reason
    on potato_sessions (user_id, interrupted, interrupt_reason);
