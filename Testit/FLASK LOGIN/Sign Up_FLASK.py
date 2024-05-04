from flask import Flask, request, render_template, session, redirect, url_for
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'ERITTÄIN_VAHVA_AVAIN'

def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        database='flight_game',
        user='root',
        password='ROOT'
    )
    return connection

@app.route('/')
def form():
    return render_template('Signup_page_test.html')

@app.route('/submit', methods=['POST'])
def submit():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)  # Hash the password

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_score (username, password) VALUES (%s, %s)",
            (username, hashed_password)  # Store the hashed password
        )
        conn.commit()
        cursor.close()
        conn.close()

        return '<html><head><meta http-equiv="refresh" content="5;url=/login"></head><body><p>Käyttäjä Rekisteröity! Sinut ohjataan kirjautumaan 5 sekunnin kuluttua!</p></body></html>'

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password, highscore FROM user_score WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user[0], password):  # Check the hash instead of comparing directly
            session['username'] = username
            session['highscore'] = user[1]
            return redirect(url_for('highscore_page1'))
        else:
            return 'Virheellinen Käyttäjä ja/tai salasana.'
    return render_template('Login_page_test.html')

@app.route('/highscore_page1')
def highscore_page1():
    if 'username' in session:
        return render_template('Highscore_page_test.html', username=session['username'], highscore=session.get('highscore', 'No highscore recorded'))
    else:
        return redirect(url_for('login'))

@app.route('/highscore_page2')
def highscore_page2():
    if 'username' in session:
        return render_template('Highscore_page2_test.html', username=session['username'], highscore=session.get('highscore', 'No highscore recorded'))
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('highscore', None)  #rivit 75-76 tyhjentävät session
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
