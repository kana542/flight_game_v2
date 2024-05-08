from flask import Flask, jsonify, request, render_template, session, redirect, url_for
from db_utils import fetch_random_airport, init_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__, template_folder='HTML')
app.secret_key = 'ERITTÄIN_VAHVA_AVAIN'

@app.route('/')
def form():
    return render_template('Signup_page_test.html')

@app.route('/submit', methods=['POST'])  # tämä rekisteröi käyttäjän ja hänen salasanansa tietokantaan
def submit():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_password = generate_password_hash(password)

        conn = init_db_connection()
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
        conn = init_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT password, highscore FROM user_score WHERE username = %s", (username,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user and check_password_hash(user[0], password):
            session['username'] = username
            session['highscore'] = user[1]  # rivit 52-54 ylläpitävät session
            return redirect(url_for('Main_Page'))
        else:
            return 'Virheellinen Käyttäjä ja/tai salasana.'
    return render_template('Login_page_test.html')


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
        return render_template('BUENIS.html', username=session['username'], highscore=session.get('highscore'))
    else:
        return redirect(url_for('login'))

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