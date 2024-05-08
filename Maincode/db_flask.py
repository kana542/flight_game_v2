
from flask import Flask, jsonify
from flask_cors import CORS
from db_connection import init_db_connection, fetch_random_airport

app = Flask(__name__)
CORS(app)

@app.route('/fetch_airport')
def fetch_airport():
    db = init_db_connection()  # Alustetaan tietokantayhteys
    data = fetch_random_airport(db)  # Haetaan satunnainen lentokenttä
    return jsonify(data)  # Palautetaan data sellaisenaan

if __name__ == '__main__':
    app.run()
