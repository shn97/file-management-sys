-- DROP TABLE IF EXISTS users;
CREATE TABLE IF NOT EXISTS users (
  id integer PRIMARY KEY AUTOINCREMENT,
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  root_folder_id integer NOT NULL UNIQUE,

  CONSTRAINT fk_root_folder_id
    FOREIGN KEY (root_folder_id)
    REFERENCES files (id)
);

-- DROP TABLE IF EXISTS files;
CREATE TABLE IF NOT EXISTS files(
  id integer PRIMARY KEY AUTOINCREMENT,
  parent_id integer DEFAULT -1 NOT NULL,
  file_name text NOT NULL,
  file_key text DEFAULT NULL UNIQUE
);

