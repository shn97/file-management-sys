import uuid
import os
from typing import Optional, List
from database.DatabaseManagment import DatabaseManagement

class File:
    FILES_DIR = "./files"
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

    def to_dict(self):
        return dict(
            file_id=self._id,
            file_name=self._file_name,
            is_folder=self._file_key is None
        )

    @staticmethod
    def check_file_key_exists(file_key: str) -> bool:
        if file_key is not None:
            query = "SELECT id FROM files " \
                    "WHERE file_key=:file_key GROUP BY file_key;"
            params = dict(file_key=file_key)
            results, row_id, row_count = File.db_manager.execute_query(query, params)
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
        return File.create_folder(file_name)

    @staticmethod
    def create_folder(file_name: str, parent_id: int = -1) -> Optional["File"]:
        query = "INSERT INTO files (file_name, parent_id) " \
                "VALUES (:file_name, :parent_id);"
        params = dict(file_name=file_name, parent_id=parent_id)
        results, row_id, row_count = File.db_manager.execute_query(query, params)

        if row_id is not None and row_id > 0:
            folder = File(file_name)
            folder.set_id(row_id)
            folder.set_parent_id(parent_id)
            return folder
        return None

    @staticmethod
    def get_file(file_id: int) -> Optional["File"]:
        query = "SELECT * FROM files WHERE id=:file_id;"
        params = dict(file_id=file_id)
        results, row_id, row_count = File.db_manager.execute_query(query, params)
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
        results, row_id, row_count = File.db_manager.execute_query(query, params)
        files = list()
        if results is not None and len(results) > 0:
            for result in results:
                file_id, parent_id, file_name, file_key = result
                file = File()
                file.set_id(file_id)
                file.set_parent_id(parent_id)
                file.set_file_name(file_name)
                file.set_file_key(file_key)
                files.append(file)
        return files

    @staticmethod
    def add_file(file, parent_id: int, file_name: str, is_folder: bool) -> Optional["File"]:
        if is_folder:
            file_key = None
        else:
            file_key = File.generate_unique_file_key()

        if File.save_file_to_disk(file, file_key):
            query = "INSERT INTO files (parent_id, file_name, file_key) " \
                    "VALUES (:parent_id, :file_name, :file_key);"
            params = dict(file_name=file_name, parent_id=parent_id, file_key=file_key)

            results, row_id, row_count = File.db_manager.execute_query(query, params)

            if row_id is not None and row_id > 0:
                new_file = File(file_name)
                new_file.set_id(row_id)
                new_file.set_parent_id(parent_id)
                new_file.set_file_name(file_name)
                new_file.set_file_key(file_key)
                return new_file
        return None

    @staticmethod
    def update_file_name(file_id: int, new_file_name: str) -> bool:
        query = "UPDATE files SET file_name=:new_file_name " \
                "WHERE id=:file_id;"
        params = dict(file_id=file_id, new_file_name=new_file_name)
        results, row_id, row_count = File.db_manager.execute_query(query, params)

        if row_count is not None and row_count == 1:
            return True
        return False

    @staticmethod
    def delete_file(file_id: int) -> bool:
        success = True
        file = File.get_file(file_id)
        if file is not None:
            is_file = file.get_file_key() is not None
            if is_file:
                success = File.delete_file_from_disk(file.get_file_key()) and File.delete_file_from_db(file_id)
            else:
                children = File.get_children_files(file_id)
                if children is not None:
                    for child in children:
                        success = success and File.delete_file(child.get_id())
                success = success and File.delete_file_from_db(file_id)
        return success

    @staticmethod
    def delete_file_from_db(file_id: int) -> bool:
        query = "DELETE FROM files WHERE id=:file_id;"
        params = dict(file_id=file_id)
        results, row_id, row_count = File.db_manager.execute_query(query, params)

        if row_count is not None and row_count == 1:
            return True
        return False

    @staticmethod
    def save_file_to_disk(file, file_key: str) -> bool:
        try:
            file.save(os.path.join(File.FILES_DIR, file_key))
            return True
        except Exception as e:
            print(e)
        return False

    @staticmethod
    def delete_file_from_disk(file_key: str) -> bool:
        file_path = os.path.join(File.FILES_DIR, file_key)
        try:
            if os.path.isfile(file_path):
                os.unlink(file_path)
                return True
        except Exception as e:
            print(e)
        return False


