CREATE TABLE IF NOT EXISTS users (
    id bigint generated always as identity,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    PRIMARY KEY (id),
    UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS user_roles (
                            user_id bigint REFERENCES users(id),
                            role VARCHAR(50) NOT NULL
);

ALTER TABLE user_roles ADD CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role);
