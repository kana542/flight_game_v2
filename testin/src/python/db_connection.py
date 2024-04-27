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
                SELECT c.iso_country, a.name, a.latitude_deg, a.longitude_deg
                FROM country AS c
                JOIN airport AS a ON c.iso_country = a.iso_country
                WHERE c.continent = 'EU' AND a.type != 'closed'
                ORDER BY RAND()
                LIMIT 1;
                """
                cursor.execute(sql)
                result = cursor.fetchone()

                if result is None:
                    raise Exception("No airport found.")
                
                iso_country, airport_name, latitude, longitude = result
                
    # db error handling
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    # other error handling
    except Exception as err:
        print(f"Error: {err}")

    return {
        "Country": iso_country,
        "Airport Name": airport_name,
        "Latitude": latitude,
        "Longitude": longitude
    }