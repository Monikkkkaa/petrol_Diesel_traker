-- SQL Schema for Fuel Price Tracker

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
    slug text PRIMARY KEY,
    name text NOT NULL,
    state text NOT NULL,
    last_scraped_at timestamp with time zone DEFAULT NULL
);

-- Create fuel_prices table
CREATE TABLE IF NOT EXISTS fuel_prices (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    city_slug text NOT NULL REFERENCES cities(slug) ON DELETE CASCADE,
    date date NOT NULL,
    petrol_price numeric(10, 2) NOT NULL,
    diesel_price numeric(10, 2) NOT NULL,
    scraped_at timestamp with time zone DEFAULT now(),
    -- Unique constraint to prevent duplicate entries per city per day
    CONSTRAINT unique_city_date UNIQUE (city_slug, date)
);

-- Index for fast queries ordered by date DESC
CREATE INDEX IF NOT EXISTS idx_fuel_prices_city_date ON fuel_prices(city_slug, date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_prices ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (SELECT)
CREATE POLICY "Allow public read access to cities" ON cities
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read access to fuel_prices" ON fuel_prices
    FOR SELECT TO public USING (true);
