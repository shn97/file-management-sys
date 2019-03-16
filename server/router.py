from flask import Flask, request, render_template, g, jsonify, send_from_directory, session, make_response

from server.database.DatabaseManagment import DatabaseManagement
from server.models.User import User
import json

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
    user = User(data.get("username"), data.get("password"))
    result = User.create_user(user)
    return jsonify(success=result)

@app.route('/')
def main_page():
    return send_from_directory('templates','index.html')

@app.route('/templates/jsx/<path>')
def add_js_file(path):
    return send_from_directory('templates/jsx', path)

@app.route('/templates/css/<path>')
def add_css_file(path):
    return send_from_directory('templates/css', path)

if __name__  == "__main__":
    app.run(debug=True)