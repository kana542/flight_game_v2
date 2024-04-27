from flask import Flask, jsonify
from db_connection import airport_location

app = Flask(__name__)

@app.route('/fetch_airport')

def fetch_airport():
    data = airport_location()
    # checks if the first value is None, if yes, then the others are too
    if data['Latitude'] is None:
        return jsonify({'error': 'No data found.'}), 404
    else:
        return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)