from flask import Flask, request, render_template, g, jsonify

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
    args = request.args
    user = User(args.get("username"), args.get("password"))
    result = db_manager.create_user(user)
    return jsonify(success=result)

if __name__  == "__main__":
    app.run(debug=True)