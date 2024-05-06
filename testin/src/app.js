// Alustetaan pelitila objektiksi
const gameState = {
    currentRound: 0,
    maxRounds: 5,
    map: null,
    marker: null,
    guessMade: false,
    roundData: {
        streetViewLocation: null,
        guessLocation: null
    },