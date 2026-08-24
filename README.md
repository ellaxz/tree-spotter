# TreeSpotter 🌳

A location-based web app that shows you real street trees near you in
Melbourne, using open data from the City of Melbourne. Click any tree to
see its species, planting year, and life expectancy.

## Tech stack

Frontend: React, Vite, React Leaflet
Backend: Node.js, Express
Database: MongoDB Atlas, with a 2dsphere geospatial index

## Data source

Tree data comes from the City of Melbourne's open data portal:
[trees-with-species-and-dimensions-urban-forest](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/),
licensed under CC BY 4.0.

## Running locally

Backend:

```bash
cd server
npm install
node index.js
```

Frontend:

```bash
npm install
npm run dev
```
