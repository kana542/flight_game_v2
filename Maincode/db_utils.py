import mysql.connector
from mysql.connector import Error

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