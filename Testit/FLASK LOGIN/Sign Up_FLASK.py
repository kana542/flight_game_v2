from flask import Flask, request, render_template
import mysql.connector

app = Flask(__name__)

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

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO user_score (username, password) VALUES (%s, %s)",
            (username, password)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return f'<html><head><meta http-equiv="refresh" content="5;url=/login"></head><body><p>Käyttäjä Rekisteröity! Sinut ohjataan kirjautumaan 5 sekunnin kuluttua!</p></body></html>'
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

        if user and user[0] == password:
            return render_template('Highscore_page_test.html', username=username, highscore=user[1])
        else:
            return 'Virheellinen Käyttäjä ja/tai salasana.'
    return render_template('Login_page_test.html')

if __name__ == '__main__':
    app.run(debug=True)