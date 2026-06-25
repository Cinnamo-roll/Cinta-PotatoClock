create table users (
    id bigint primary key auto_increment,
    username varchar(50) not null,
    email varchar(120) null,
    nickname varchar(50) not null,
    avatar_url varchar(500) null,
    password_hash varchar(100) not null,
    role varchar(20) not null,
    status varchar(20) not null,
    last_login_at datetime null,
    created_at datetime not null,
    updated_at datetime not null,
    unique key idx_users_username (username),
    unique key idx_users_email (email)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table user_settings (
    id bigint primary key auto_increment,
    user_id bigint not null,
    focus_minutes int not null,
    short_break_minutes int not null,
    long_break_minutes int not null,
    long_break_interval int not null,
    auto_start_break boolean not null,
    auto_start_focus boolean not null,
    sound_enabled boolean not null,
    vibration_enabled boolean not null,
    theme_mode varchar(20) not null,
    theme_color varchar(50) not null,
    created_at datetime not null,
    updated_at datetime not null,
    unique key uk_user_settings_user_id (user_id),
    constraint fk_user_settings_user foreign key (user_id) references users (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table tasks (
    id bigint primary key auto_increment,
    user_id bigint not null,
    title varchar(120) not null,
    description text null,
    status varchar(20) not null,
    priority varchar(20) not null,
    estimated_potatoes int not null,
    completed_potatoes int not null,
    is_current boolean not null,
    sort_order int not null,
    deleted boolean not null,
    completed_at datetime null,
    created_at datetime not null,
    updated_at datetime not null,
    index idx_tasks_user_id (user_id),
    index idx_tasks_user_status (user_id, status),
    index idx_tasks_user_current (user_id, is_current),
    constraint fk_tasks_user foreign key (user_id) references users (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;

create table potato_sessions (
    id bigint primary key auto_increment,
    user_id bigint not null,
    task_id bigint null,
    mode varchar(20) not null,
    planned_minutes int not null,
    actual_minutes int not null,
    started_at datetime not null,
    ended_at datetime not null,
    completed boolean not null,
    interrupted boolean not null,
    note varchar(500) null,
    created_at datetime not null,
    index idx_sessions_user_id (user_id),
    index idx_sessions_task_id (task_id),
    index idx_sessions_user_started_at (user_id, started_at),
    index idx_sessions_user_mode (user_id, mode),
    constraint fk_sessions_user foreign key (user_id) references users (id),
    constraint fk_sessions_task foreign key (task_id) references tasks (id)
) engine=InnoDB default charset=utf8mb4 collate=utf8mb4_unicode_ci;
