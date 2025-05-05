ALTER TABLE chats ADD COLUMN is_personal bool not null default false;

ALTER TABLE chat_messages ADD COLUMN user_id bigint;