from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from db_utils import fetch_random_airport, init_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='HTML')
app.secret_key = 'ERITTÄIN_VAHVA_AVAIN'

@app.route('/')
def form():
    return render_template('Signup_page_test.html')

from flask import request, make_response
from werkzeug.security import generate_password_hash
from mysql.connector import IntegrityError, connect

@app.route('/submit', methods=['POST'])
def submit():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        conn = init_db_connection()
        cursor = conn.cursor()

        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS user_score (
                    id INT(11) NOT NULL AUTO_INCREMENT,
                    username VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    highscore INT(11) DEFAULT 0,
                    PRIMARY KEY (id),
                    UNIQUE KEY username_unique (username)
                );
            """)

            cursor.execute(
                "INSERT INTO user_score (username, password) VALUES (%s, %s)",
                (username, hashed_password)
            )
            conn.commit()
            return redirect(url_for('login'))
        except IntegrityError as e:
            if 'Duplicate entry' in str(e) and 'username' in str(e):
                error_message = 'Käyttäjänimi on jo käytössä. Yritä uudelleen toisella käyttäjänimellä.'
                return render_template('Signup_page_test.html', error=error_message)
            else:
                raise
        finally:
            cursor.close()
            conn.close()

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = init_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password, highscore FROM user_score WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user[0], password):
            session['username'] = username
            session['highscore'] = user[1]
            return redirect(url_for('Main_Page'))
        else:
            error_message = 'Virheellinen käyttäjänimi ja/tai salasana. Yritä uudelleen.'
            return render_template('Login_page_test.html', error=error_message)  # Pass the error message to the template
    return render_template('Login_page_test.html', error=None)  # Initially render the page without errors



@app.route('/Main_page')
def Main_Page():
    if 'username' in session:
        return render_template('Front_page.html', username=session['username'], highscore=session.get('highscore'))
    else:
        return redirect(url_for('login'))

@app.route('/fetch_airport')
def fetch_airport():
    data = fetch_random_airport()  # assuming fetch_random_airport is imported
    return jsonify(data)

@app.route('/Peli')
def Peli():
    if 'username' in session:
        return render_template('Game.html', username=session['username'], highscore=session.get('highscore'))
    else:
        return redirect(url_for('login'))

@app.route('/update_highscore', methods=['POST'])
def update_highscore():
    if 'username' in session:
        new_score = request.json['score']
        username = session['username']
        conn = init_db_connection()
        cursor = conn.cursor()

        # Fetch the current highscore to compare
        cursor.execute("SELECT highscore FROM user_score WHERE username = %s", (username,))
        current_highscore = cursor.fetchone()[0]

        if new_score > current_highscore:
            cursor.execute("UPDATE user_score SET highscore = %s WHERE username = %s", (new_score, username))
            conn.commit()
            updated = True
        else:
            updated = False

        cursor.close()
        conn.close()

        return jsonify({"updated": updated, "new_highscore": new_score if updated else current_highscore})
    else:
        return jsonify({"error": "User not logged in"}), 403


@app.route('/highscore_page')
def highscore_page2():
    if 'username' in session:
        username = session['username']
        conn = init_db_connection()
        cursor = conn.cursor()

        # Hakee tuloksen nykyiseltä kirjaudutulta käyttäjältä
        cursor.execute("SELECT highscore FROM user_score WHERE username = %s", (username,))
        user_highscore = cursor.fetchone()[0]

        # Hakee tuloksen kaikilta käyttäjiltä
        cursor.execute("SELECT username, highscore FROM user_score ORDER BY highscore DESC LIMIT 5")
        highscores = cursor.fetchall()

        cursor.close()
        conn.close()

        return render_template('Highscore_page_test.html', username=username, highscore=user_highscore, highscores=highscores)
    else:
        return redirect(url_for('login'))

@app.route('/tutorial')
def tutorial():
    if 'username' in session:
        return render_template('Tutorial.html', username=session['username'])
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('highscore', None)  # rivit 75-76 tyhjentävät session
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)