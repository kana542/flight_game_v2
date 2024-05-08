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


@app.route('/submit', methods=['POST'])  # tämä rekisteröi käyttäjän ja hänen salasanansa tietokantaan
def submit():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        conn = get_db_connection()
        cursor = conn.cursor()

        # Tarkista, onko taulu olemassa ja luo se tarvittaessa
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_score (
                id int(11) NOT NULL AUTO_INCREMENT,
                username varchar(255) NOT NULL,
                password varchar(255) NOT NULL,
                highscore int(11) DEFAULT 0,
                PRIMARY KEY (id),
                UNIQUE KEY (username)
            );
        """)

        # Varsinainen Rekisteröinti tietokantaan
        cursor.execute(
            "INSERT INTO user_score (username, password) VALUES (%s, %s)",
            (username, hashed_password)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return '<html><head><meta http-equiv="refresh" content="5;url=/login"></head><body><p>Käyttäjä Rekisteröity! Sinut ohjataan kirjautumaan 5 sekunnin kuluttua!</p></body></html>'



@app.route('/login', methods=['GET', 'POST'])  # tällä henkilö kirjautuu olemassaolevalla tunnuksella sisään rekisteröitymisen jälkeen
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

        if user and check_password_hash(user[0], password):
            session['username'] = username
            session['highscore'] = user[1]  # rivit 52-54 ylläpitävät session
            return redirect(url_for('highscore_page1'))
        else:
            return 'Virheellinen Käyttäjä ja/tai salasana.'
    return render_template('Login_page_test.html')


@app.route('/highscore_page1')
def highscore_page1():
    if 'username' in session:
        return render_template('Highscore_page_test.html', username=session['username'], highscore=session.get('highscore'))
    else:
        return redirect(url_for('login'))


@app.route('/highscore_page2')
def highscore_page2():
    if 'username' in session:
        username = session['username']
        conn = get_db_connection()
        cursor = conn.cursor()

        # Hakee tuloksen nykyiseltä kirjaudutulta käyttäjältä
        cursor.execute("SELECT highscore FROM user_score WHERE username = %s", (username,))
        user_highscore = cursor.fetchone()[0]

        # Hakee tuloksen kaikilta käyttäjiltä
        cursor.execute("SELECT username, highscore FROM user_score ORDER BY highscore DESC LIMIT 5")
        highscores = cursor.fetchall()

        cursor.close()
        conn.close()

        return render_template('Highscore_page2_test.html', username=username, highscore=user_highscore, highscores=highscores)
    else:
        return redirect(url_for('login'))


@app.route('/logout')
def logout():
    session.pop('username', None)
    session.pop('highscore', None)  # rivit 75-76 tyhjentävät session
    return redirect(url_for('login'))


if __name__ == '__main__':
    app.run(debug=True)