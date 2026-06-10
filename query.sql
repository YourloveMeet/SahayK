select
    trigger_name,
    event_object_table,
    action_statement
from information_schema.triggers
where event_object_schema = 'auth';

select
    conname,
    pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'profiles'::regclass;
