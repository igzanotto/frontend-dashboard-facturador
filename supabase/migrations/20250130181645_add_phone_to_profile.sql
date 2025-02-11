 -- Drop the existing trigger first
drop trigger if exists on_auth_user_created on auth.users;

-- Drop the existing function
drop function if exists public.handle_new_user();

-- Create the updated function with phone metadata handling
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
        avatar_url,
        phone
    )
    values (
        new.id,
        new.email,
        split_part(CASE 
            WHEN raw_meta->>'name' IS NOT NULL THEN raw_meta->>'name'
            ELSE ''
        END, ' ', 1),
        CASE 
            WHEN raw_meta->>'name' IS NOT NULL THEN 
                NULLIF(substr(raw_meta->>'name', strpos(raw_meta->>'name', ' ') + 1), '')
            ELSE NULL
        END,
        CASE 
            WHEN raw_meta->>'picture' IS NOT NULL THEN raw_meta->>'picture'
            WHEN raw_meta->>'avatar_url' IS NOT NULL THEN raw_meta->>'avatar_url'
            ELSE null
        END,
        CASE
            WHEN new.phone IS NOT NULL THEN new.phone
            WHEN raw_meta->>'phone' IS NOT NULL THEN raw_meta->>'phone'
            ELSE null
        END
    );
    return new;
end;
$$;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();