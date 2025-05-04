ALTER TABLE chats ADD COLUMN is_personal bool not null default false;

select * from pg_indexes;