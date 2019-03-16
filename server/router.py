from flask import Flask, request, render_template, g, jsonify, send_from_directory

from server.database.DatabaseManagment import DatabaseManagement
from server.models.User import User

app = Flask(__name__)

db_manager = DatabaseManagement(app)
db_manager.create_db()

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/api/login')
def login():
    return

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.form
    user = User(data.get("username"), data.get("password"))
    result = db_manager.create_user(user)
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