"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import StateSelector from "@/components/StateSelector";
import CitySelector from "@/components/CitySelector";
import PriceCard from "@/components/PriceCard";
import { Fuel, Shield, AlertTriangle, HelpCircle, Activity } from "lucide-react";

interface City {
  slug: string;
  name: string;
  state: string;
}

interface PriceRow {
  id: number;
  city_slug: string;
  date: string;
  petrol_price: number;
  diesel_price: number;
  scraped_at: string;
}

export default function Home() {
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  
  const [cities, setCities] = useState<{ slug: string; name: string }[]>([]);
  const [selectedCitySlug, setSelectedCitySlug] = useState<string>("");
  const [selectedCityName, setSelectedCityName] = useState<string>("");
  
  const [currentPrice, setCurrentPrice] = useState<PriceRow | null>(null);
  const [previousPrice, setPreviousPrice] = useState<PriceRow | undefined>(undefined);
  
  const [loadingStates, setLoadingStates] = useState<boolean>(true);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch unique states on mount
  useEffect(() => {
    async function fetchStates() {
      setLoadingStates(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from("cities")
          .select("state");

        if (dbError) throw dbError;

        if (data) {
          // Extract unique states in JS
          const uniqueStates = Array.from(
            new Set(data.map((c: any) => c.state))
          ).sort() as string[];
          setStates(uniqueStates);
        }
      } catch (err: any) {
        console.error("Error fetching states:", err);
        setError("Failed to load states. Please ensure your Supabase configuration is correct.");
      } finally {
        setLoadingStates(false);
      }
    }

    fetchStates();
  }, []);

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([]);
      setSelectedCitySlug("");
      setCurrentPrice(null);
      setPreviousPrice(undefined);
      return;
    }

    async function fetchCities() {
      setLoadingCities(true);
      setSelectedCitySlug("");
      setCurrentPrice(null);
      setPreviousPrice(undefined);
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase
          .from("cities")
          .select("slug, name")
          .eq("state", selectedState)
          .order("name", { ascending: true });

        if (dbError) throw dbError;

        if (data) {
          setCities(data);
        }
      } catch (err: any) {
        console.error("Error fetching cities:", err);
        setError("Failed to load cities for the selected state.");
      } finally {
        setLoadingCities(false);
      }
    }

    fetchCities();
  }, [selectedState]);

  // Fetch prices when city changes
  useEffect(() => {
    if (!selectedCitySlug) {
      setCurrentPrice(null);
      setPreviousPrice(undefined);
      return;
    }

    const cityObj = cities.find((c) => c.slug === selectedCitySlug);
    if (cityObj) {
      setSelectedCityName(cityObj.name);
    }

    async function fetchPrices() {
      setLoadingPrices(true);
      setError(null);
      
      try {
        const { data, error: dbError } = await supabase
          .from("fuel_prices")
          .select("*")
          .eq("city_slug", selectedCitySlug)
          .order("date", { ascending: false })
          .limit(2);

        if (dbError) throw dbError;

        if (data && data.length > 0) {
          setCurrentPrice(data[0]);
          setPreviousPrice(data.length > 1 ? data[1] : undefined);
        } else {
          setCurrentPrice(null);
          setPreviousPrice(undefined);
        }
      } catch (err: any) {
        console.error("Error fetching prices:", err);
        setError("Failed to fetch fuel prices for the selected city.");
      } finally {
        setLoadingPrices(false);
      }
    }

    fetchPrices();
  }, [selectedCitySlug, cities]);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-indigo-950/20 via-transparent to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Container */}
      <div className="max-w-4xl w-full mx-auto px-4 py-12 md:py-20 flex-grow">
        
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800/80 mb-4 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
              India Fuel Tracker
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Fuel className="w-10 h-10 text-indigo-500" />
            Fuel Price Tracker
          </h1>
          <p className="mt-3 text-zinc-400 max-w-md mx-auto text-sm md:text-base font-medium">
            Daily updated Petrol and Diesel prices across major cities in India, sourced directly from Cardekho.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Controls Card */}
        <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-6 items-end">
          <StateSelector
            states={states}
            selectedState={selectedState}
            onChange={setSelectedState}
            loading={loadingStates}
          />

          <CitySelector
            cities={cities}
            selectedCitySlug={selectedCitySlug}
            onChange={setSelectedCitySlug}
            loading={loadingCities}
            disabled={!selectedState}
          />
        </div>

        {/* Loading Prices Spinner */}
        {loadingPrices && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-zinc-500 font-medium">Fetching fuel rates...</p>
          </div>
        )}

        {/* Price Card Results */}
        {!loadingPrices && currentPrice && (
          <PriceCard
            currentPrice={currentPrice}
            previousPrice={previousPrice}
            cityName={selectedCityName}
          />
        )}

        {/* Empty state (when city is selected but no data is in DB) */}
        {!loadingPrices && selectedCitySlug && !currentPrice && (
          <div className="mt-8 p-8 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl border-dashed text-center flex flex-col items-center justify-center gap-3">
            <HelpCircle className="w-10 h-10 text-zinc-600" />
            <h3 className="font-bold text-zinc-300">No rates available for {selectedCityName}</h3>
            <p className="text-sm text-zinc-500 max-w-sm">
              We haven't scraped the prices for this city yet. Ensure your daily scraper cron job has executed or run it manually.
            </p>
          </div>
        )}

        {/* Welcome / Instruction state */}
        {!selectedCitySlug && (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-400">
            <div className="p-5 bg-zinc-900/10 border border-zinc-800/40 rounded-xl flex flex-col gap-2">
              <span className="text-indigo-400 font-semibold text-xs tracking-wider uppercase">Step 1</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose a State from the dropdown to load its major urban centers.
              </p>
            </div>
            <div className="p-5 bg-zinc-900/10 border border-zinc-800/40 rounded-xl flex flex-col gap-2">
              <span className="text-indigo-400 font-semibold text-xs tracking-wider uppercase">Step 2</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select a City from the list. We track the top 5–10 locations per state.
              </p>
            </div>
            <div className="p-5 bg-zinc-900/10 border border-zinc-800/40 rounded-xl flex flex-col gap-2">
              <span className="text-indigo-400 font-semibold text-xs tracking-wider uppercase">Step 3</span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Analyze today's prices, compare differences, and see update trends.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 py-6 text-center text-xs text-zinc-600">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-medium">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-700" />
            <span>Secure connection via Supabase client direct queries</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Fuel Price Tracker. Built with Next.js & Tailwind.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
