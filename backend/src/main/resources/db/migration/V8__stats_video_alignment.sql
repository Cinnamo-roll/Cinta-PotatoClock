alter table checkin_records
    modify column type varchar(30) not null;

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
