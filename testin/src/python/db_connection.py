def airport_location():
    import mysql.connector
    from mysql.connector import Error

    # empty values for the error handling
    iso_country = None
    airport_name = None
    coordinates = None

    try:
        # new connection to the db
        db = mysql.connector.connect(
            host="127.0.0.1",
            port=3306,
            database="flight_game",
            user="root",
            password="apple13"
        )

        cursor = db.cursor()

        # random eu country
        sql_country = "SELECT iso_country FROM country WHERE continent = 'EU' ORDER BY RAND() LIMIT 1"
        cursor.execute(sql_country)
        result = cursor.fetchone()
        if result is None:
            raise Exception("No country found.")
        iso_country = result[0]

        # random airport from the country
        sql_airport = "SELECT name FROM airport WHERE iso_country = %s AND type != 'closed' ORDER BY RAND() LIMIT 1"
        cursor.execute(sql_airport, (iso_country,))
        result = cursor.fetchone()
        if result is None:
            raise Exception(f"No airport found for {iso_country}")
        airport_name = result[0]

        # coordinates from 
        sql_coordinates = "SELECT latitude_deg, longitude_deg FROM airport WHERE name = %s"
        cursor.execute(sql_coordinates, (airport_name,))
        result = cursor.fetchone()
        if result is None:
            raise Exception(f"No coordinates found for {airport_name}")
        coordinates = result
        
    # db error handling
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    # code error handling
    except Exception as err:
        print(f"Error: {err}")
    
    # if everything works we good and close the connection
    finally:
        if "cursor" in locals():
            cursor.close()
        if "db" in locals():
            db.close()

    return {
        "Country": iso_country,
        "Airport Name": airport_name,
        "Coordinates": coordinates
    }