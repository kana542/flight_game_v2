V.2

Uudet mahdolliset ideat:

Kuvien implementointi

Uudenlainen vihje systeemi V.2:een. Tarkoituksena on implimentoida kuva vihjeitä generoitujen tekstivihjeiden sijaan, tai kanssa. Merkitsevä asia kuvien käytössä on "Royalty-free" -kuvien käyttö, jotta nämä näyttävät hyviltä tulevaisuudessa(CV, Linkedin, jne.)
Riippuen kuinka nopeaa itse kuvien generointi on voimme käyttää sitä suoraan. Jos generoiminen on liian hidasta, meillä on mahdollisuus käyttää kuvatekstuuri tekniikkaa, jolla me liitetään kuvat yhteen isoksi tekstuuriksi ja otamme koordinaatteja eri kohdista tekstuurista, joka lopputuloksena näyttää meille halutun kuvan. Projektissa toin puheeksi databasen käytön puhelussa, mutta päädyttiin lopputulokseen, ettei sitä kannattaisi tehdä verrannollisen työmäärän ja ajan käytön suhteen



############### Jonne ###############

Skyhawk 2.0 keskittyy tuomaan visuaalisemman pelielämyksen selaimessa.

Idea: Periaatteessa geoguessr ripoff.

Peli hyödyntää edelleen sql tietokantaa, missä lentoasemat sijaitsevat mutta nyt siellä on myös pelaaja tiedot kirjautumista varten. Peliä voi pelata selaimessa joko kirjautumatta tai kirjautumalla, jolloin kierrokset/pisteet saadaan ylös.

Selaimen sivut:
Etusivu
Peli
Kirjautuminen
Tutoriaali

Pelissä siis arvotaan sql tietokannasta saatujen lentoaseman gps-koordinaattien avulla google street view näkymä, missä pelaaja voi liikkua eri suuntiin yrittäen arvata missä lentoasema sijaitsee. Vieressä on erillinen ikkuna missä on google maps kartta näkymä mihin pelaaja laittaa arvauksensa. Kun arvaus vahvistetaan, pelaaja saa pisteitä riippuen kuinka lähelle hänen arvauksensa osui. Kierroksia per peli on 5 ja jokaisesta kierroksesta on mahdollista saada max 1000 pistettä. Kun kierrokset ovat ohi, näkyy scoreboard missä on kirjautuneiden pelaajien high scoret (pelaajat, jotka eivät kirjaudu, eivät päädy listalle/scoreboardille).

Peli hyödyntää seuraavia rajapintoja: Google maps api, google street view api
