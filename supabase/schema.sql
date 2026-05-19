create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text not null,
  full_name text not null,
  role text not null check (role in ('employee', 'manager', 'admin')),
  manager_id uuid references users(id),
  department text,
  created_at timestamptz default now()
);

create table if not exists cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  goal_setting_opens date not null,
  q1_opens date not null,
  q2_opens date not null,
  q3_opens date not null,
  q4_opens date not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references cycles(id) not null,
  employee_id uuid references users(id) not null,
  thrust_area text not null,
  title text not null,
  description text,
  uom_type text not null check (uom_type in ('min', 'max', 'timeline', 'zero')),
  target numeric,
  target_date date,
  weightage numeric not null check (weightage >= 10),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'returned', 'locked')),
  -- Manager approval/rejection metadata (comment is the "approved/not approved" message to the employee)
  manager_comment text,
  manager_decided_at timestamptz,
  is_shared boolean default false,
  shared_from uuid references goals(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) not null,
  quarter text not null check (quarter in ('Q1','Q2','Q3','Q4')),
  actual_achievement numeric,
  actual_date date,
  progress_status text not null default 'not_started' check (progress_status in ('not_started','on_track','completed')),
  manager_comment text,
  checked_in_at timestamptz,
  manager_checked_in_at timestamptz,
  score numeric,
  created_at timestamptz default now(),
  unique(goal_id, quarter)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  record_id uuid not null,
  changed_by uuid references users(id),
  action text not null,
  old_value jsonb,
  new_value jsonb,
  changed_at timestamptz default now()
);

create table if not exists escalation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  type text not null,
  triggered_at timestamptz default now(),
  resolved boolean default false
);

alter table users enable row level security;
alter table cycles enable row level security;
alter table goals enable row level security;
alter table checkins enable row level security;
alter table audit_logs enable row level security;
alter table escalation_logs enable row level security;

create or replace function current_user_role() returns text language sql stable as $$
  select role from users where clerk_user_id = auth.jwt() ->> 'sub' limit 1;
$$;

create or replace function current_user_uuid() returns uuid language sql stable as $$
  select id from users where clerk_user_id = auth.jwt() ->> 'sub' limit 1;
$$;

create or replace function is_team_member(target_user uuid) returns boolean language sql stable as $$
  select exists(select 1 from users u where u.id = target_user and u.manager_id = current_user_uuid());
$$;

create policy users_select_employee_manager_admin on users for select using (
  current_user_role() = 'admin' or id = current_user_uuid() or manager_id = current_user_uuid()
);

create policy cycles_read_all on cycles for select using (current_user_role() in ('employee','manager','admin'));
create policy cycles_admin_write on cycles for all using (current_user_role() = 'admin') with check (current_user_role() = 'admin');

create policy goals_select_policy on goals for select using (
  current_user_role() = 'admin' or
  employee_id = current_user_uuid() or
  is_team_member(employee_id)
);
create policy goals_insert_employee_admin on goals for insert with check (
  current_user_role() = 'admin' or employee_id = current_user_uuid()
);
create policy goals_update_policy on goals for update using (
  current_user_role() = 'admin' or employee_id = current_user_uuid() or is_team_member(employee_id)
);

create policy checkins_select_policy on checkins for select using (
  exists(select 1 from goals g where g.id = goal_id and (
    current_user_role() = 'admin' or g.employee_id = current_user_uuid() or is_team_member(g.employee_id)
  ))
);
create policy checkins_write_policy on checkins for all using (
  exists(select 1 from goals g where g.id = goal_id and (
    current_user_role() = 'admin' or g.employee_id = current_user_uuid() or is_team_member(g.employee_id)
  ))
) with check (
  exists(select 1 from goals g where g.id = goal_id and (
    current_user_role() = 'admin' or g.employee_id = current_user_uuid() or is_team_member(g.employee_id)
  ))
);

create policy audit_admin_only on audit_logs for all using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
create policy escalation_admin_manager on escalation_logs for select using (current_user_role() in ('admin','manager'));
create policy escalation_admin_write on escalation_logs for all using (current_user_role() = 'admin') with check (current_user_role() = 'admin');
