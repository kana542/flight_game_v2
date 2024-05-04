
***Mitä on tehty***

Flask rekisteröinti, kirjautuminen ja pisteiden haku tietokannasta testipohjat ovat nyt luotu.

Session pitäisi nyt toimia teoriassa, tämän testasin kahdella eri highscore sivulla jossa molemmissa ylläpidetään pelaajan käyttäjänimi ja highscore näkyvissä. 

Session lisäksi loin hashed-salasanoja werkzeug.security kirjaston avulla huvikseen. (tämä ei tarvitse olla varsinaisessa projektissa)

Ennen kuin testaatte koodia pitää luoda uusi pöytä flight_game tietokantaan.

Uuden pöydän luonti tapahtuu näillä lauseilla MariaDBssä testausta varten:
CREATE TABLE new_user_score (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    highscore int(11) DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY (username)
);

Tämä lause näyttää kaikki pöydän tiedot ei kokonaisena, mutta luettavana. syynä siksi koska hashed salasana on liian pitkä suoraan tulostukseen:
SELECT id, username, LEFT(password, 30) AS password, highscore FROM user_score;


Tämä lause poistaa käyttäjän:
DELETE FROM user_score WHERE id = 'id-numero';


Tämä lause resettaa id järjestyksen käyttäjissä:
ALTER TABLE user_score AUTO_INCREMENT = 1;


***Mitä ei ole vielä tehty (nämä asiat ovat minun vastuulla)***

koko highscore listan haku ja niiden järjestykseen laittaminen ei ole vielä luotu, mutta uskon että ei ole kovin vaikea homma. Error handling ei ole myöskään täysin valmis, mutta on nyt väliaikaisesti pienessä prioriteetissa. Koodin luettavuus on myös omasta mielestäni vielä heikommasta päästä, joten se pitäisi parantaa ajan myötä

***Mitä voi jo käyttää ja suosittelen muiden testaavan (Erityisesti Frontend)***

Periaatteessa pohjat ja niiden idea on vain antaa suuntaa varsinaisen Frontendin luontiin. HTML-sivut mitä branchissä löytyvät ovat aikalailla placeholdereita, ja jätän varsinaisen ulkonäön ja sommittelun Villelle sekä Joelille.

***Huomioita kun käytätte omassa koodissa***

On äärimmäisen tärkeää ylläpitää sessio jotta käyttäjän tiedot pysyvät kasassa eikä ne vain katoa kesken kaiken. Ilman ylläpitoa meidän login-system ei tee yhtikäs mitään.