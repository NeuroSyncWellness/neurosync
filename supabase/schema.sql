create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references auth.users(id) on delete cascade,
  name text not null,
  date_of_birth date not null,
  age integer not null check (age between 0 and 120),
  created_at timestamptz not null default now()
);

alter table public.children
  add column if not exists parent_id uuid references auth.users(id) on delete cascade;

alter table public.children enable row level security;

drop policy if exists "Parents can view their children" on public.children;
create policy "Parents can view their children"
  on public.children for select
  using (auth.uid() = parent_id);

drop policy if exists "Parents can create their children" on public.children;
create policy "Parents can create their children"
  on public.children for insert
  with check (auth.uid() = parent_id);

drop policy if exists "Parents can update their children" on public.children;
create policy "Parents can update their children"
  on public.children for update
  using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);

drop policy if exists "Parents can delete their children" on public.children;
create policy "Parents can delete their children"
  on public.children for delete
  using (auth.uid() = parent_id);

create table if not exists public.profile_answers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  question_1 text not null,
  question_2 text not null,
  question_3 text not null,
  question_4 text not null,
  question_5 text not null,
  question_6 text not null,
  question_7 text not null,
  question_8 text not null,
  question_9 text not null,
  question_10 text not null,
  question_11 text not null,
  question_12 text not null,
  question_13 text not null,
  question_14 text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_answers enable row level security;

drop policy if exists "Users can view their own profile answers" on public.profile_answers;
create policy "Users can view their own profile answers"
  on public.profile_answers for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own profile answers" on public.profile_answers;
create policy "Users can insert their own profile answers"
  on public.profile_answers for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own profile answers" on public.profile_answers;
create policy "Users can update their own profile answers"
  on public.profile_answers for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
