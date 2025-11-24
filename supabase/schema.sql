--
-- comprehensive schema for studyweb
--

-- 1. drop existing objects to ensure a clean slate
drop policy if exists "allow delete on own profile" on public.profiles;
drop policy if exists "allow update on own profile" on public.profiles;
drop policy if exists "allow read for authenticated users" on public.profiles;
drop policy if exists "allow insert for authenticated users" on public.profiles;
drop policy if exists "allow delete for owners" on public.assignments;
drop policy if exists "allow update for owners" on public.assignments;
drop policy if exists "allow insert for class owners" on public.assignments;
drop policy if exists "allow read for class members" on public.assignments;
drop policy if exists "allow delete for owners" on public.class_members;
drop policy if exists "allow insert for authenticated users" on public.class_members;
drop policy if exists "allow read for class members" on public.class_members;
drop policy if exists "allow delete for owners" on public.classes;
drop policy if exists "allow update for owners" on public.classes;
drop policy if exists "allow insert for authenticated users" on public.classes;
drop policy if exists "allow read for class members" on public.classes;

drop table if exists public.assignments;
drop table if exists public.class_members;
drop table if exists public.classes;
drop table if exists public.profiles;

drop function if exists public.create_user_profile;

-- 2. create tables

-- profiles table
create table
  public.profiles (
    id uuid not null primary key references auth.users (id) on delete cascade,
    updated_at timestamp with time zone null,
    full_name text null,
    avatar_url text null,
    role text null default 'student'::text
  );

-- classes table
create table
  public.classes (
    id uuid not null default gen_random_uuid () primary key,
    created_at timestamp with time zone not null default now(),
    name text not null,
    description text null,
    owner_id uuid not null references auth.users (id) on delete cascade
  );

-- class_members table
create table
  public.class_members (
    class_id uuid not null references public.classes (id) on delete cascade,
    user_id uuid not null references auth.users (id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    role text not null default 'student'::text,
    primary key (class_id, user_id)
  );

-- assignments table
create table
  public.assignments (
    id uuid not null default gen_random_uuid () primary key,
    class_id uuid not null references public.classes (id) on delete cascade,
    created_at timestamp with time zone not null default now(),
    title text not null,
    due_date timestamp with time zone null,
    content jsonb null
  );

-- 3. create function to handle new user profile creation
create function public.create_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'student'
  );
  return new;
end;
$$;

-- 4. create trigger to call the function on new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_user_profile();


-- 5. enable row level security (rls)
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;

-- 6. create rls policies

-- profiles policies
create policy "allow read for authenticated users" on public.profiles for select using (auth.uid() is not null);
create policy "allow insert for authenticated users" on public.profiles for insert with check (auth.uid() = id);
create policy "allow update on own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "allow delete on own profile" on public.profiles for delete using (auth.uid() = id);

-- classes policies
create policy "allow read for class members" on public.classes for select using (
  id in (select class_id from public.class_members where user_id = auth.uid())
  or owner_id = auth.uid()
);
create policy "allow insert for authenticated users" on public.classes for insert with check (auth.uid() = owner_id);
create policy "allow update for owners" on public.classes for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "allow delete for owners" on public.classes for delete using (auth.uid() = owner_id);

-- class_members policies
create policy "allow read for class members" on public.class_members for select using (
  class_id in (select class_id from public.class_members where user_id = auth.uid())
);
create policy "allow insert for authenticated users" on public.class_members for insert with check (auth.uid() is not null);
create policy "allow delete for owners" on public.class_members for delete using (
  class_id in (select id from public.classes where owner_id = auth.uid())
  or user_id = auth.uid() -- users can leave classes
);

-- assignments policies
create policy "allow read for class members" on public.assignments for select using (
  class_id in (select class_id from public.class_members where user_id = auth.uid())
  or class_id in (select id from public.classes where owner_id = auth.uid())
);
create policy "allow insert for class owners" on public.assignments for insert with check (
  class_id in (select id from public.classes where owner_id = auth.uid())
);
create policy "allow update for owners" on public.assignments for update using (
  class_id in (select id from public.classes where owner_id = auth.uid())
) with check (
  class_id in (select id from public.classes where owner_id = auth.uid())
);
create policy "allow delete for owners" on public.assignments for delete using (
  class_id in (select id from public.classes where owner_id = auth.uid())
);
