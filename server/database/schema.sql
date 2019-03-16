-- DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY AUTOINCREMENT,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

-- DROP TABLE IF EXISTS files;
CREATE TABLE IF NOT EXISTS files(
  id integer PRIMARY KEY AUTOINCREMENT,
  parent_id text NOT NULL,
  file_name text NOT NULL
);

