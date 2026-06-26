create table public.activity_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    action text not null,
    details text,
    ip_address text,
    location text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.activity_logs enable row level security;

create policy "Users can view their own activity logs" on public.activity_logs
    for select using (auth.uid() = user_id);

create policy "Users can insert their own activity logs" on public.activity_logs
    for insert with check (auth.uid() = user_id);

create policy "Super Admins can view all activity logs" on public.activity_logs
    for select using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'superadmin'
        )
    );
