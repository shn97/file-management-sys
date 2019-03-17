import os
from flask import Flask, request, render_template, g, jsonify, send_from_directory, session, make_response
from werkzeug.utils import secure_filename

from server.database.DatabaseManagment import DatabaseManagement
from server.models.User import User
from server.models.File import File

import json

UPLOAD_DIR = "./files"

app = Flask(__name__)
# TODO: Make a more secure secret key
app.secret_key = "some secret key"

db_manager = DatabaseManagement()
db_manager.create_db(app)

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/api/users', methods=['GET'])
def login():
    data = request.args
    user = User(data.get("username"), data.get("password"))
    is_authenticated = user.check_user_exist()
    if is_authenticated:
        session['user'] = user.to_json()
    return jsonify(success=is_authenticated)

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.form
    username, password = data.get("username"), data.get("password")
    folder = File.create_user_root_folder(username)
    user = User(username, password, folder.get_id())
    result = User.create_user(user)
    return jsonify(success=result)

@app.route('/api/logout', methods=['GET'])
def logout():
    session.pop('user')
    return jsonify(success=True)

@app.route('/api/files', methods=['GET'])
def get_files():
    user = User.from_json(session['user'])
    data = request.args
    parent_id = int(data.get("parentId"))
    success = False
    files = []
    if user is not None:
        if parent_id == -1:
            optional_file = File.get_file(user.get_root_folder_id())
            if optional_file is not None:
                files.append(optional_file)
                success = True
        else:
            files = File.get_children_files(parent_id)
            success = True

    files_dict_list = [file.to_dict() for file in files]
    return jsonify(success=success, data=files_dict_list)

@app.route('/api/files', methods=['POST'])
def upload_file():
    data = request.form
    parent_id = int(data.get("parentId"))
    success = False
    msg = ""
    if request.method == "POST":
        if "file" not in request.files:
            msg = "No file to upload"
        else:
            file = request.files["file"]
            if file.filename == "":
                msg = "File name cannot be empty"
            else:
                # TODO: Add  file type/extension check
                filename = secure_filename(file.filename)
                File.add_file(file, parent_id, filename, False)
                success = True
    return jsonify(success=success, msg=msg)

@app.route('/api/files', methods=['PUT'])
def update_file_name():
    data = request.form
    file_id, new_file_name = int(data.get("file_id")), data.get("new_file_name")
    success = File.update_file_name(file_id, new_file_name)

    return jsonify(success=success)

@app.route('/api/files', methods=['DELETE'])
def delete_file():
    data = request.form
    file_id = int(data.get("file_id"))
    success = File.delete_file(file_id)

    return jsonify(success=success)

@app.route('/api/download', methods=['POST'])
def get_download_file():
    data = request.form
    file_id = int(data.get("file_id"))
    abs_dir_path = os.path.join(app.root_path, File.FILES_DIR)
    file_key = ""
    file_name = ""
    optional_file = File.get_file(file_id)
    if optional_file is not None:
        file_key = optional_file.get_file_key()
        file_name = optional_file.get_file_name()

    return send_from_directory(abs_dir_path, file_key,
                               as_attachment=True, attachment_filename=file_name)

@app.route('/')
def main_page():
    return send_from_directory('templates', 'index.html')

@app.route('/templates/jsx/<path>')
def add_js_file(path):
    return send_from_directory('templates/jsx', path)

@app.route('/templates/css/<path>')
def add_css_file(path):
    return send_from_directory('templates/css', path)

if __name__  == "__main__":
    app.run(debug=True)