import sqlite3
import hashlib
from flask import g

from server.models import User


class DatabaseManagement:

    def __init__(self, app):
        self.app = app
        self.DATABASE_PATH = "db.sqlite3"
        self.SCHEMA_PATH = "database\\schema.sql"
        self.db = None

    def get_db(self):
        db = getattr(g, '_database', None)
        if db is None:
            db = g._database = sqlite3.connect(self.DATABASE_PATH)
        return db

    def create_db(self):
        with self.app.app_context():
            self.db = self.get_db()
            with self.app.open_resource(self.SCHEMA_PATH, mode='r') as f:
                self.db.cursor().executescript(f.read())
            self.db.commit()

    def execute_query(self, query, parameters):
        result = None
        try:
            conn = self.get_db()
            cur = conn.cursor()
            cur.execute(query, parameters)
            conn.commit()
            result = cur.lastrowid
        except sqlite3.Error as e:
            print(e)
        finally:
            cur.close()
            conn.close()

        return result

    def create_user(self, user: User):
        # TODO: Check if username and password is valid before create_user
        # TODO:  Check if user exists, return false and err msg
        hashed_password = hashlib.sha256(user.password.encode("ascii")).hexdigest()
        query = "INSERT INTO users (username, password) VALUES (:username, :password);"
        params = dict(username=user.username, password=hashed_password)
        result = self.execute_query(query, params)
        if result is not None and result > 0:
            return True
        return False

