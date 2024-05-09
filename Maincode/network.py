from flask import request, make_response
from werkzeug.security import generate_password_hash
from mysql.connector import IntegrityError, connect
import mysql.connector
from mysql.connector import Error
#bueen
def init_db_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="ROOT",
            database="flight_game"
        )
    except mysql.connector.Error as err:
        print(f"DB Connection Error: {err}")

def fetch_random_airport():
    db_connection = init_db_connection()
    cursor = db_connection.cursor()
    cursor.execute("""
        SELECT country.iso_country, airport.name, airport.latitude_deg, airport.longitude_deg
        FROM country
        JOIN airport ON country.iso_country = airport.iso_country
        WHERE country.continent = 'EU' AND airport.type != 'closed'
        ORDER BY RAND()
        LIMIT 1;
    """)
    result = cursor.fetchone()
    cursor.close()
    db_connection.close()

    if result:
        iso_country, airport_name, latitude, longitude = result
        return {
            "Country": iso_country,
            "Airport Name": airport_name,
            "Latitude": latitude,
            "Longitude": longitude
        }
    else:
        return None
    
from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='templates')
app.secret_key = 'ERITTÄIN_VAHVA_AVAIN'

@app.route('/')
def form():
    return render_template('login_page.html')

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
                return render_template('signup_page.html', error=error_message)
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
            return redirect(url_for('main_page'))
        else:
            error_message = 'Virheellinen käyttäjänimi ja/tai salasana. Yritä uudelleen.'
            return render_template('login_page.html', error=error_message)
    return render_template('login_page.html', error=None)

@app.route('/main_page')
def main_page():
    if 'username' in session:
        return render_template('front_page.html', username=session['username'], highscore=session.get('highscore'))
    else:
        return redirect(url_for('login'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle registration logic here
        return redirect(url_for('login'))
    return render_template('signup_page.html')


@app.route('/fetch_airport')
def fetch_airport():
    data = fetch_random_airport()
    return jsonify(data)

@app.route('/game')
def game():
    if 'username' in session:
        return render_template('game.html', username=session['username'], highscore=session.get('highscore'))
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

        return render_template('highscore_page.html', username=username, highscore=user_highscore, highscores=highscores)
    else:
        return redirect(url_for('login'))

@app.route('/tutorial')
def tutorial():
    if 'username' in session:
        return render_template('tutorial.html', username=session['username'])
    else:
        return redirect(url_for('login'))

@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('highscore', None)  # rivit 75-76 tyhjentävät session
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)