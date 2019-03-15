DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id integer PRIMARY KEY,
  username text NOT NULL,
  password text NOT NULL
);

DROP TABLE IF EXISTS files;
CREATE TABLE files (
  id integer PRIMARY KEY,
  parent_id text NOT NULL,
  file_name text NOT NULL
);

