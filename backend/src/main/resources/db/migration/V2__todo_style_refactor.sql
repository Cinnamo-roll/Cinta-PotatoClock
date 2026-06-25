create table todo_collections (
    id bigint primary key auto_increment,
    user_id bigint not null,
    name varchar(80) not null,
    description text null,
    sort_order int not null default 0,
    deleted boolean not null default false,
    created_at datetime not null,
    updated_at datetime not null,
    index idx_collections_user_id (user_id),
    index idx_collections_user_deleted (user_id, deleted),
    constraint fk_collections_user foreign key (user_id) references users (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

alter table tasks
    add column collection_id bigint null after user_id,
    add column duration_minutes int not null default 25 after description,
    add column timer_type varchar(20) not null default 'countdown' after duration_minutes,
    add column category varchar(20) not null default 'normal' after timer_type,
    add column background_style varchar(100) not null default 'default' after is_current,
    add column count_to_stats boolean not null default true after background_style;

update tasks set status = 'running' where status = 'doing';

alter table tasks
    add index idx_tasks_collection_id (collection_id),
    add index idx_tasks_user_collection (user_id, collection_id),
    add constraint fk_tasks_collection foreign key (collection_id) references todo_collections (id);

alter table potato_sessions
    add column collection_id bigint null after task_id,
    add column timer_type varchar(20) not null default 'countdown' after collection_id,
    add column category varchar(20) not null default 'normal' after timer_type,
    add column count_to_stats boolean not null default true after interrupted;

alter table potato_sessions
    add index idx_sessions_collection_id (collection_id),
    add index idx_sessions_user_timer_type (user_id, timer_type),
    add index idx_sessions_user_completed_stats (user_id, completed, count_to_stats),
    add constraint fk_sessions_collection foreign key (collection_id) references todo_collections (id);

alter table user_settings
    add column default_duration_minutes int not null default 25 after focus_minutes,
    add column auto_start_next boolean not null default false after auto_start_focus;

update user_settings set theme_color = 'pink' where theme_color = 'potato';
