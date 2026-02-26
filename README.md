CompareHub — Price Comparison Web App
<img width="1891" height="937" alt="image" src="https://github.com/user-attachments/assets/4c5bf57c-197c-48f3-ac72-024c27b9662b" />


CompareHub is a web application that lets users search for products and instantly compare prices, ratings, and offers across multiple online stores — helping shoppers make informed buying decisions in one place.
Live link: https://comparehub-delta.vercel.app/

🚀 What It Does

CompareHub:

Searches products by name, brand, or category.

Displays product cards showing best price and top rating.

Shows detail pages with comprehensive specs and all offers.

Lets users filter by category, brand, price range, and rating.

Enables product comparison (select 2–4 items) for side-by-side analysis.

Tracks and sorts offers by best price, highest rating, and store.

🎯 Key Features
🛍 Unified Price Comparison

Compare offers from multiple top retailers (Amazon, BestBuy, Walmart, etc.) with real prices and ratings.

🔍 Advanced Filtering

Filter by category, brand, price range, and minimum rating to quickly refine results.

📊 Side-by-Side Product Comparison

Select multiple products and compare their specs, prices, and ratings in a single view.

📦 Detailed Product Pages

Each product page shows specifications, images, and individual offers with direct “Buy” links.

★ Filters with Fallbacks

If a specific filter (e.g., condition or store) results in no matching offers, the system gracefully falls back to available data.

🧠 Tech Stack

Frontend

React (Vite)

React Router for routing

Tailwind CSS for styling

Fetch API for backend communication

Backend

Go (Gin framework)

PostgreSQL database

Lateral SQL queries to compute best prices

Deployment

Frontend deployed on Vercel

Backend can be deployed on platforms like Render, Railway, or Fly

PostgreSQL can be on Neon, Supabase, or other providers

🗂 Project Structure (Filesystem)
/backend
  /handlers
    products.go          # API handlers for listing & retrieving products & offers
  main.go                # Backend server entrypoint
/models
/migrations
  seed.sql               # Demo data for stores, products, offers, specs
/frontend
  /src
    /pages               # Home, Product, Compare pages
    /lib                 # Helpers (API paths, utils)
    App.jsx
    index.jsx
tailwind.config.js
vite.config.js
README.md

🧪 How It Works (High-Level)

User visits app (Home page).

User types a search term (e.g., “laptop”).

Frontend calls backend API /products.

Backend:

Loads products

Uses LATERAL SQL to find best offer per product

Filters offers by price, rating, and optional store/condition

Frontend displays product cards with:

Best price

Best rating

Thumbnail image

Clicking Details shows full offers and specs.

Users can select products for comparison.

🧠 Backend: Best Price Logic (Recruiter-Friendly Description)

The backend uses PostgreSQL’s efficient LATERAL joins to compute the best available offer for each product. A LATERAL subquery evaluates each product individually, selecting the lowest priced offer that matches selected filters (e.g., store or condition), or gracefully falling back if filters exclude all offers.

This ensures:

Fast aggregated price computation

Accurate results even under complex filters

📌 Example Backend Endpoint
GET /products

Query parameters:

q — search term

sort — “low”, “high”, “rating”

category, brand

minPrice, maxPrice

minRating

stores — comma-separated (e.g., “Amazon,BestBuy”)

condition — “New”, “Used”, “Any”

[
  {
    "id": 1,
    "name": "iPhone 15 Pro",
    "brand": "Apple",
    "bestPrice": 979.99,
    "bestSource": "BestBuy",
    "bestRating": 4.7,
    "bestUrl": "https://...",
    "reviewCount": 18234
  },
  ...
]

📦 Setup & Run (Development)
Backend

Install Go (1.18+)

go mod tidy

Configure .env with:

DATABASE_URL=postgres://<user>:<pass>@<host>:<port>/<db>


Run migrations & seed:

psql $DATABASE_URL < migrations/seed.sql


Start backend:

go run ./backend


API listens (e.g.) at http://localhost:8000.

Frontend

Install dependencies:

cd frontend
npm install


Set API base URL (in code or .env)

Start dev server:

npm run dev


App runs at http://localhost:5173 by default.

🧪 Optional Enhancements

Add pagination on product listing

Add user authentication & wishlist persistence

Integrate live scraping feeds

Add price history graphs
