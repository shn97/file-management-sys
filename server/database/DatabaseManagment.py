import sqlite3
from flask import g

class DatabaseManagement:

    def __init__(self):
        self.DATABASE_PATH = "db.sqlite3"
        self.SCHEMA_PATH = "database\\schema.sql"
        self.db = None

    def get_db(self):
        return sqlite3.connect(self.DATABASE_PATH)

    def create_db(self, app):
        if app is not None:
            with app.app_context():
                self.db = self.get_db()
                with app.open_resource(self.SCHEMA_PATH, mode='r') as f:
                    self.db.cursor().executescript(f.read())
                self.db.commit()

    def execute_query(self, query, parameters) -> (list, int):
        result = None
        try:
            conn = self.get_db()
            cur = conn.cursor()
            cur.execute(query, parameters)
            conn.commit()
            result = cur.fetchall(), cur.lastrowid
        except sqlite3.Error as e:
            print(e)
        finally:
            cur.close()
            conn.close()

        return result



