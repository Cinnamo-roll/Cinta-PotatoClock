create table if not exists future_plans (
    id bigint primary key auto_increment,
    user_id bigint not null,
    title varchar(120) not null,
    note text null,
    target_date date not null,
    deleted boolean not null default false,
    created_at datetime not null,
    updated_at datetime not null,
    constraint fk_future_plans_user foreign key (user_id) references users (id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

set @idx_exists = (
    select count(1)
    from information_schema.statistics
    where table_schema = database()
      and table_name = 'future_plans'
      and index_name = 'idx_future_plans_user_target'
);
set @sql = if(@idx_exists = 0,
    'create index idx_future_plans_user_target on future_plans (user_id, deleted, target_date)',
    'select 1'
);
prepare stmt from @sql;
execute stmt;
deallocate prepare stmt;
