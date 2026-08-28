# TreeSpotter 🌳

A location-based web app that helps you discover real street trees around Melbourne using open data from the City of Melbourne.

Click any tree to see its species, planting year, and life expectancy.

## Why I built this

I've always liked the shapes of trees. Each one has its own character. Living in Melbourne, I kept spotting trees that looked familiar but had no idea what they were called.

That's how TreeSpotter started. Point at a tree, discover its name, and see the streets around you a little differently.

## Features

- Geolocation-based map showing nearby trees with bounding-box queries that update as you pan and zoom
- Click any tree to view its details and a species photo from Wikipedia, using a two-step lookup to handle taxonomy naming changes
- Marker clustering for a cleaner view when zoomed out
- Resizable sidebar on desktop and a bottom sheet on mobile

## Tech stack

**Frontend:** React, Vite, React Leaflet, react-leaflet-cluster, Tailwind CSS, react-resizable-panels, lucide-react
**Backend:** Node.js, Express
**Database:** MongoDB Atlas with a 2dsphere geospatial index

## Data source

Tree data comes from the [City of Melbourne Open Data Portal](https://data.melbourne.vic.gov.au/explore/dataset/trees-with-species-and-dimensions-urban-forest/), licensed under CC BY 4.0.

## Planned improvements

- Basic API tests with Vitest, covering normal queries, missing parameters, and empty results
- Empty-state messaging when no trees are found in the current view

## Running locally

### Backend

```bash
cd server
npm install
node index.js
```

### Frontend

```bash
npm install
npm run dev
```
