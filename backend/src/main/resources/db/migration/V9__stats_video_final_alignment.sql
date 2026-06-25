create table if not exists checkin_records (
    id bigint primary key auto_increment,
    user_id bigint not null,
    type varchar(30) not null,
    checkin_time datetime not null,
    note varchar(255) null,
    created_at datetime not null,
    updated_at datetime not null,
    constraint fk_checkin_records_user foreign key (user_id) references users (id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

alter table checkin_records
    modify column type varchar(30) not null;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'potato_sessions'
      and column_name = 'interrupt_reason'
);
set @sql = if(@column_exists = 0,
    'alter table potato_sessions add column interrupt_reason varchar(50) null after interrupted',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'default_stats_range'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column default_stats_range varchar(20) not null default ''week'' after theme_color',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'week_start_day'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column week_start_day varchar(20) not null default ''monday'' after default_stats_range',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'show_month_stats'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column show_month_stats boolean not null default true after week_start_day',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'show_interruption_reasons'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column show_interruption_reasons boolean not null default true after show_month_stats',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'show_year_stats'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column show_year_stats boolean not null default true after show_interruption_reasons',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @column_exists = (
    select count(1)
    from information_schema.columns
    where table_schema = database()
      and table_name = 'user_settings'
      and column_name = 'study_mode_enabled'
);
set @sql = if(@column_exists = 0,
    'alter table user_settings add column study_mode_enabled boolean not null default false after completion_sound',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

alter table user_settings
    alter column default_stats_range set default 'week';

update user_settings
set default_stats_range = 'week'
where default_stats_range = 'day';

set @idx_exists = (
    select count(1)
    from information_schema.statistics
    where table_schema = database()
      and table_name = 'checkin_records'
      and index_name = 'idx_checkin_records_user_type_time'
);
set @sql = if(@idx_exists = 0,
    'create index idx_checkin_records_user_type_time on checkin_records (user_id, type, checkin_time)',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @idx_exists = (
    select count(1)
    from information_schema.statistics
    where table_schema = database()
      and table_name = 'potato_sessions'
      and index_name = 'idx_potato_sessions_user_started'
);
set @sql = if(@idx_exists = 0,
    'create index idx_potato_sessions_user_started on potato_sessions (user_id, started_at)',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;

set @idx_exists = (
    select count(1)
    from information_schema.statistics
    where table_schema = database()
      and table_name = 'potato_sessions'
      and index_name = 'idx_potato_sessions_user_interruption_reason'
);
set @sql = if(@idx_exists = 0,
    'create index idx_potato_sessions_user_interruption_reason on potato_sessions (user_id, interrupted, interrupt_reason)',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;
