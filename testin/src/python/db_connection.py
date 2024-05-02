import mysql.connector
from mysql.connector import Error

def init_db_connection():
    try:
        db_connection = mysql.connector.connect(
            host="127.0.0.1",
            port=3306,
            database="flight_game",
            user="root",
            password="apple13"
        )
        print("DB Connection OK.")
        return db_connection
    except mysql.connector.Error as err:
        print(f"DB Connection Error: {err}")

def fetch_random_airport(db_connection):
    sql = """
    SELECT country.iso_country, airport.name, airport.latitude_deg, airport.longitude_deg
    FROM country
    JOIN airport ON country.iso_country = airport.iso_country
    WHERE country.continent = 'EU' AND airport.type != 'closed'
    ORDER BY RAND()
    LIMIT 1;
    """

    cursor = db_connection.cursor()
    cursor.execute(sql)
    result = cursor.fetchone()
    cursor.close()

    if result:
        iso_country, airport_name, latitude, longitude = result
        return {
            "Country": iso_country,
            "Airport Name": airport_name,
            "Latitude": latitude,
            "Longitude": longitude
        }
    else:
        return {}