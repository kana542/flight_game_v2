from flask import Flask, request, render_template, redirect, url_for
from flask_mysqldb import MySQL
import bcrypt
import logging

app = Flask(__name__)
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'password'
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_DB'] = 'flight_game'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        userDetails = request.form
        username = userDetails['username']
        password = userDetails['password'].encode('utf-8')
        hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())

        cur = mysql.connection.cursor()
        try:
            cur.execute("INSERT INTO users(username, password) VALUES(%s, %s)", (username, hashed_password.decode('utf-8')))
            mysql.connection.commit()
            cur.close()
            return redirect(url_for('login'))
        except Exception as e:
            logging.error(f"Signup failed: {e}")
            mysql.connection.rollback()
            return "Signup failed, username may already be taken"

    return render_template('signup.html')
