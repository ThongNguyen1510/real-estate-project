const { Client } = require('@googlemaps/google-maps-services-js');

const client = new Client({});

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

module.exports = {
    client,
    GOOGLE_MAPS_API_KEY
}; 