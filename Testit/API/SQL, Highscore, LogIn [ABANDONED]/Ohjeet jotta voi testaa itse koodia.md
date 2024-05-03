1. Tarvitset jonkun muun IDE kuin PyCharm, koska Pycharmissa ei ole PHP tukea. (VSCode toimii)
2. PHP-tuki PITÄÄ ladata laajennuksien kautta ja lataa itse nettisisvusta(https://windows.php.net/download#php-8.3)
3. Minuutin pituinen tutorial koko lataus ja asennus prosessista (https://www.youtube.com/watch?v=n04w2SzGr_U)
4. Asennuksen jälkeen pitää liittää PHP-built-in server, VSCodessa menet File -> Preferences -> Settings 
5. Settings searchiin kirjoitat "PHP validate Executable Path" ja klikkaat "Edit Settings.json"
6. Nyt näet rivin jossa lukee *"php.validate.executablePath": ""*
7. tyhjien kaksoisheittomerkkien väliin laitat sinun filepath jossa sinun php.exe löytyy. esim("php.validate.executablePath": "C:\\php-8.3.6\\php.exe")
8. Tämän jälkeen sinä olet asentanut kaiken mitä tarvitset, mutta joka kerta kun testaat sinun täytyy käynnistää itse server.
9. Serverin käynnistys toimii Command promptissa ja pitää paikanta ja avata pää- PHP-tiedosto jota aiot testata.
10. kirjoitat siis command promptiin ja suoritat komennon: cd *tiedoston sijainti*
11. Seuraavaksi kirjoitat ja suoritat: php -S localhost:8000
12. Tämän jälkeen pidät CMD auki ja voit testata koodia vapaasti, jos suljet CMD sinun täytyy tehdä ohjeen askeleiden 10-11 mukaan uudestaan.