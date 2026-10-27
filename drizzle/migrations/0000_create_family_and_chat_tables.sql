create table public.family_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind text not null check (kind in ('parent','child')),
  name text not null,
  date_of_birth date,
  birth_time text,
  birthplace text,
  relationship text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  family_member_id uuid references public.family_members(id) on delete set null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index family_members_user_idx on public.family_members(user_id);
create index chat_threads_user_idx on public.chat_threads(user_id);
create index chat_messages_thread_idx on public.chat_messages(thread_id);

grant select, insert, update, delete on public.family_members to authenticated;
grant all on public.family_members to service_role;
grant select, insert, update, delete on public.chat_threads to authenticated;
grant all on public.chat_threads to service_role;
grant select, insert, update, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;

alter table public.family_members enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users can view own family members" on public.family_members for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own family members" on public.family_members for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own family members" on public.family_members for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own family members" on public.family_members for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view own chat threads" on public.chat_threads for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own chat threads" on public.chat_threads for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own chat threads" on public.chat_threads for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own chat threads" on public.chat_threads for delete to authenticated using (auth.uid() = user_id);

create policy "Users can view messages in own threads" on public.chat_messages for select to authenticated using (exists (select 1 from public.chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()));
create policy "Users can insert messages in own threads" on public.chat_messages for insert to authenticated with check (exists (select 1 from public.chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()));
create policy "Users can update messages in own threads" on public.chat_messages for update to authenticated using (exists (select 1 from public.chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid())) with check (exists (select 1 from public.chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()));
create policy "Users can delete messages in own threads" on public.chat_messages for delete to authenticated using (exists (select 1 from public.chat_threads t where t.id = chat_messages.thread_id and t.user_id = auth.uid()));