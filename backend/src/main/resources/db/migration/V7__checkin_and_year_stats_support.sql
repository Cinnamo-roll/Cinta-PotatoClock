create table checkin_records (
    id bigint primary key auto_increment,
    user_id bigint not null,
    type varchar(20) not null,
    checkin_time datetime not null,
    note varchar(255) null,
    created_at datetime not null,
    updated_at datetime not null,
    index idx_checkin_records_user_id (user_id),
    index idx_checkin_records_user_type_time (user_id, type, checkin_time),
    constraint fk_checkin_records_user foreign key (user_id) references users (id) on delete cascade
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

alter table user_settings
    add column show_checkin_stats boolean not null default true after show_task_ranking,
    add column show_year_stats boolean not null default true after show_checkin_stats;

alter table user_settings
    alter column default_stats_range set default 'week';

update user_settings
set default_stats_range = 'week'
where default_stats_range = 'day';
