import hashlib
from json import dumps
from server.database.DatabaseManagment import DatabaseManagement

class User( ):
    db_manager = DatabaseManagement()

    def default(self, o):
        kv_pairs = self.__dict__
        kv_pairs.pop("password")
        return kv_pairs

    def to_json(self):
        return dumps(self, default=self.default)

    def __init__(self, username, password):
        self.username = username
        self.password = password
        self._is_authenticated = False

    @staticmethod
    def get_hashed_data(data) -> str:
        return hashlib.sha256(data.encode("ascii")).hexdigest()

    @staticmethod
    def create_user(user: "User") -> bool:
        # TODO: Check if username and password is valid before create_user
        # TODO:  Check if user exists, return false and err msg
        hashed_password = User.get_hashed_data(user.password)
        query = "INSERT INTO users (username, password) VALUES (:username, :password);"
        params = dict(username=user.username, password=hashed_password)
        results, rowid = User.db_manager.execute_query(query, params)

        if rowid is not None and rowid > 0:
            return True
        return False

    def check_user_exist(self) -> bool:
        hashed_password = User.get_hashed_data(self.password)
        query = "SELECT * FROM users WHERE username=:username AND password=:password;"
        params = dict(username=self.username, password=hashed_password)

        results, rowid = User.db_manager.execute_query(query, params)

        self._is_authenticated = results is not None and len(results) == 1
        return self._is_authenticated


