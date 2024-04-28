def airport_location():
    import mysql.connector
    from mysql.connector import Error

    # empty values for the error handling
    iso_country = None
    airport_name = None
    latitude = None
    longitude = None

    try:
        # new connection to the db
        with mysql.connector.connect(
            host="127.0.0.1",
            port=3306,
            database="flight_game",
            user="root",
            password="apple13"
        ) as db:
            with db.cursor() as cursor:
                sql = """
                SELECT country.iso_country, airport.name, airport.latitude_deg, airport.longitude_deg
                FROM country
                JOIN airport ON country.iso_country = airport.iso_country
                WHERE country.continent = 'EU' AND airport.type != 'closed'
                ORDER BY RAND()
                LIMIT 1;
                """
                
                cursor.execute(sql)
                result = cursor.fetchone()

                if result is None:
                    raise Exception("Error: no airport found.")
                
                iso_country, airport_name, latitude, longitude = result
                
    # db error handling
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    # other error handling
    except Exception as err:
        print(f"Error: {err}")

    # if everything works, returns the data
    return {
        "Country": iso_country,
        "Airport Name": airport_name,
        "Latitude": latitude,
        "Longitude": longitude
    }