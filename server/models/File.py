import uuid
from typing import Optional, Union, List
from server.database.DatabaseManagment import DatabaseManagement

class File:
    FILES_DIR = "/server/files/"
    ROOT_FOLDER_PREFIX = "root_"
    db_manager = DatabaseManagement()

    def __init__(self, file_name=None):
        self._id = -1
        self._parent_id = -1
        self._file_name = file_name
        self._file_key = None

    def get_id(self) -> int:
        return self._id

    def get_parent_id(self) -> int:
        return self._parent_id

    def get_file_key(self) -> str:
        return self._file_key

    def get_file_name(self) -> str:
        return self._file_name

    def set_id(self, _id):
        self._id = _id

    def set_parent_id(self, parent_id):
        self._parent_id = parent_id

    def set_file_key (self, file_key):
        self._file_key = file_key

    def set_file_name(self, file_name):
        self._file_name = file_name

    def upload (self):
        if self._file_name is not None:
            return

    def create_folder (self, folder_name):
        return

    def to_dict(self):
        return dict(
            file_id=self._id,
            file_name=self._file_name
        )

    @staticmethod
    def check_file_key_exists(file_key: str) -> bool:
        if file_key is not None:
            query = "SELECT COUNT(*) FROM files " \
                    "WHERE file_key=:file_key GROUP BY file_key;"
            params = dict(file_key=file_key)
            results, row_id = File.db_manager.execute_query(query, params)
            if results is not None and results[0][0]  > 0:
                return True
        return False

    @staticmethod
    def check_user_root_folder_exists(file_name: str) -> bool:
        if file_name is not None:
            query = "SELECT * FROM files " \
                    "WHERE id=-1 AND file_name=:file_name;"
            params = dict(file_name=file_name)
            results, row_id = File.db_manager.execute_query(query, params)
            if results is not None and len(results) > 0:
                return True
        return False

    @staticmethod
    def generate_unique_file_key() -> str:
        file_key = None
        while file_key is None or File.check_file_key_exists(file_key):
            file_key = uuid.uuid4().hex
        return file_key

    @staticmethod
    def create_user_root_folder(username: str) -> Optional["File"]:
        file_name = File.ROOT_FOLDER_PREFIX + username

        if not File.check_user_root_folder_exists(file_name):
            query = "INSERT INTO files (file_name) VALUES (:file_name);"
            params = dict(file_name=file_name)
            results, row_id = File.db_manager.execute_query(query, params)

            if row_id is not None and row_id > 0:
                root_folder = File(file_name)
                root_folder.set_id(row_id)
                return root_folder
        return None

    @staticmethod
    def get_file(file_id: int) -> Optional["File"]:
        query = "SELECT * FROM files WHERE id=:file_id;"
        params = dict(file_id=file_id)
        results, row_id = File.db_manager.execute_query(query, params)
        if results is not None and len(results) == 1:
            file_id, parent_id, file_name, file_key = results[0]
            file = File()
            file.set_id(file_id)
            file.set_parent_id(parent_id)
            file.set_file_name(file_name)
            file.set_file_key(file_key)
            return file
        else:
            return None

    @staticmethod
    def get_children_files(parent_id: int) -> List["File"]:
        query = "SELECT * FROM files f WHERE parent_id=:parent_id"
        params = dict(parent_id=parent_id)
        results, row_id = File.db_manager.execute_query(query, params)
        files = list()
        if results is not None and len(results) == 1:
            file_id, parent_id, file_name, file_key = results[0]
            file = File()
            file.set_id(file_id)
            file.set_parent_id(parent_id)
            file.set_file_name(file_name)
            file.set_file_key(file_key)
            files.append(file)
        return files




