
***Mitä on tehty***

Flask rekisteröinti, kirjautuminen ja pisteiden haku tietokannasta pohjat ovat nyt luotu.

Uuden pöydän luonti tapahtuu tällä koodilla:

CREATE TABLE new_user_score (
    id int(11) NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
    highscore int(11) DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY (username)
);

***Mitä ei ole vielä tehty***

Highscore-listan näkyvyys, monen käyttäjän ja niiden tuloksien haku järjestyksessä, sekä varsinainen implementointi varsinaiseen sivuun.
