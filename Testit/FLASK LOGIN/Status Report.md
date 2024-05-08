
***Mitä on tehty***

highscore page 2 nyt tulostaa 5 korkeinta tulosta ja sinun tuloksesi sivussa.

Ennen kuin testaatte koodia pitää luoda uusi pöytä flight_game tietokantaan.


Tämä lause näyttää kaikki pöydän tiedot ei kokonaisena, mutta luettavana. syynä siksi koska hashed salasana on liian pitkä suoraan tulostukseen:
SELECT id, username, LEFT(password, 30) AS password, highscore FROM user_score;


Tämä lause poistaa käyttäjän:
DELETE FROM user_score WHERE id = 'id-numero';


Tämä lause resettaa id järjestyksen käyttäjissä:
ALTER TABLE user_score AUTO_INCREMENT = 1;


***Mitä ei ole vielä tehty (nämä asiat ovat minun vastuulla)***

Ei mitään mitä olisi minulle tiedossa

***Mitä voi jo käyttää ja suosittelen muiden testaavan (Erityisesti Frontend)***

Periaatteessa pohjat ja niiden idea on vain antaa suuntaa varsinaisen Frontendin luontiin. HTML-sivut mitä branchissä löytyvät ovat aikalailla placeholdereita, ja jätän varsinaisen ulkonäön ja sommittelun Villelle sekä Joelille.

***Huomioita kun käytätte omassa koodissa***

On äärimmäisen tärkeää ylläpitää sessio jotta käyttäjän tiedot pysyvät kasassa eikä ne vain katoa kesken kaiken. Ilman ylläpitoa meidän login-system ei tee yhtikäs mitään.