

from flask import Flask, request, render_template, g

from server.database.DatabaseManagment import DatabaseManagement

app = Flask(__name__)

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/api/login')
def login():
    return

@app.route('/db/init')
def init_db():
    db_manager = DatabaseManagement(app)
    db_manager.create_db()
    return ""

if __name__  == "__main__":
    app.run()