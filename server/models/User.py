import hashlib
from typing import Optional
from json import dumps, loads
from database.DatabaseManagment import DatabaseManagement

class User( ):
    db_manager = DatabaseManagement()

    def __init__(self, username="", password="", root_folder_id=-1):
        self.username = username
        self.password = password
        self._root_folder_id = root_folder_id
        self._is_authenticated = False

    def default(self, o):
        kv_pairs = self.__dict__
        kv_pairs.pop("password")
        return kv_pairs

    def to_json(self):
        return dumps(self, default=self.default)

    def get_username(self) -> str:
        return self.username

    def get_password(self) -> str:
        return self.password

    def get_root_folder_id(self) -> int:
        return self._root_folder_id

    def get_is_authenticated(self) -> bool:
        return self._is_authenticated

    def set_username(self, username: str):
        self.username = username

    def set_password(self, password: str):
        self.password = password

    def set_root_folder_id(self, root_folder_id: int):
        self._root_folder_id = root_folder_id

    def set_is_authenticated(self, is_authenticated):
        self._is_authenticated = is_authenticated

    def check_user_exist(self) -> bool:
        hashed_password = User.get_hashed_data(self.password)
        query = "SELECT * FROM users WHERE username=:username AND password=:password;"
        params = dict(username=self.username, password=hashed_password)

        results, row_id, row_count = User.db_manager.execute_query(query, params)

        self._is_authenticated = results is not None and len(results) == 1
        if self._is_authenticated:
            id, username, password, root_folder_id = results[0];
            self._root_folder_id = root_folder_id
        return self._is_authenticated

    @staticmethod
    def from_json(json_str: str) -> "User":
        kv_pairs = loads(json_str)
        user = User()
        user.set_username(kv_pairs["username"])
        user.set_root_folder_id(int(kv_pairs["_root_folder_id"]))
        user.set_is_authenticated(int(kv_pairs["_is_authenticated"]))
        return user

    @staticmethod
    def get_hashed_data(data) -> str:
        return hashlib.sha256(data.encode("ascii")).hexdigest()

    @staticmethod
    def create_user(user: "User") -> bool:
        hashed_password = User.get_hashed_data(user.password)
        query = "INSERT INTO users (username, password, root_folder_id) " \
                "VALUES (:username, :password, :root_folder_id);"
        params = dict(username=user.username, password=hashed_password,
                      root_folder_id=user._root_folder_id)
        response = User.db_manager.execute_query(query, params)

        if response is not None:
            results, row_id, row_count = response
            if row_id is not None and row_id > 0:
                return True
        return False

    @staticmethod
    def get_user(username: str) -> Optional["User"]:
        query = "SELECT * FROM users WHERE username=:username;"
        params = dict(username=username)
        results, row_id, row_count = User.db_manager.execute_query(query, params)

        if results is not None and len(results) == 1:
            id, username, password, root_folder_id = results[0]
            user = User(username, password, root_folder_id)
            return user
        else:
            return None






