const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

// Home page
app.get('/', (req, res) => {
    res.render('index', { voli: null, errore: null });
});

// Ricerca Aeroporto con ORDINAMENTO INVERSO (Più recenti/futuri in alto)
app.get('/search-airport', async (req, res) => {
    const iataCode = req.query.airport_iata ? req.query.airport_iata.toUpperCase() : '';
    if (!iataCode) return res.render('index', { voli: null, errore: "Inserisci un codice IATA." });

    try {
        const response = await axios.get('http://api.aviationstack.com/v1/flights', {
            params: { access_key: process.env.API_KEY, arr_iata: iataCode }
        });

        let voli = response.data.data;

        if (voli && voli.length > 0) {
            voli.sort((a, b) => {
                const dataA = a.arrival.scheduled || "";
                const dataB = b.arrival.scheduled || "";
                // Invertendo dataB con dataA mettiamo i voli più "nuovi" in alto
                return dataB.localeCompare(dataA);
            });
        }

        res.render('index', { voli: voli, errore: null });
    } catch (error) {
        res.render('index', { voli: null, errore: "Errore nel recupero dati aeroporto." });
    }
});

// Ricerca Volo Singolo
app.get('/search-flight', async (req, res) => {
    const flightIata = req.query.flight_iata ? req.query.flight_iata.toUpperCase().replace(/\s/g, '') : '';
    if (!flightIata) return res.render('index', { voli: null, errore: "Inserisci un codice volo." });

    try {
        const response = await axios.get('http://api.aviationstack.com/v1/flights', {
            params: { access_key: process.env.API_KEY, flight_iata: flightIata }
        });
        res.render('index', { voli: response.data.data, errore: null });
    } catch (error) {
        res.render('index', { voli: null, errore: "Errore nel recupero dati volo." });
    }
});

app.listen(PORT, () => {
    console.log(`Server MADA attivo su http://localhost:${PORT}`);
});