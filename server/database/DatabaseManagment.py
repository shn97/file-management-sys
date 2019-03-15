import sqlite3
from flask import g

class DatabaseManagement:

    def __init__(self, app):
        self.app = app
        self.DATABASE_PATH = "db.sqlite3"
        self.SCHEMA_PATH = "database\\schema.sql"

    def get_db(self):
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(self.DATABASE_PATH)
        return db

    def create_db(self):
        with self.app.app_context():
            db = self.get_db()
            with self.app.open_resource(self.SCHEMA_PATH, mode='r') as f:
                db.cursor().executescript(f.read())
            db.commit()

