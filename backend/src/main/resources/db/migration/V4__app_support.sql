create table user_devices (
    id bigint primary key auto_increment,
    user_id bigint not null,
    platform varchar(20) not null,
    device_id varchar(120) not null,
    device_name varchar(120) null,
    app_version varchar(50) null,
    build_number varchar(50) null,
    push_token varchar(500) null,
    last_active_at datetime not null,
    created_at datetime not null,
    updated_at datetime not null,
    constraint uk_user_devices_user_device unique (user_id, device_id),
    constraint fk_user_devices_user foreign key (user_id) references users (id) on delete cascade
);

create index idx_user_devices_user_id on user_devices (user_id);
create index idx_user_devices_platform on user_devices (platform);

alter table user_settings
    add column notification_enabled boolean not null default true after vibration_enabled;
