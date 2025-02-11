-- Create a secure profiles table with RLS enabled
create table public.profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role text not null default 'user'
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Create a trigger to automatically create a profile for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
    raw_meta json;
begin
    raw_meta := new.raw_user_meta_data;
    
    insert into public.profiles (
        id,
        email,
        first_name,
        last_name,
        avatar_url
    )
    values (
        new.id,
        new.email,
        CASE 
            WHEN new.raw_user_meta_data->>'provider' = 'google' THEN raw_meta->>'name'
            ELSE null
        END,
        CASE 
            WHEN new.raw_user_meta_data->>'provider' = 'google' THEN raw_meta->>'full_name'
            ELSE null
        END,
        CASE 
            WHEN new.raw_user_meta_data->>'provider' = 'google' THEN raw_meta->>'picture'
            ELSE null
        END
    );
    return new;
end;
$$;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Add updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger handle_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at(); 