"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import StateSelector from "@/components/StateSelector";
import CitySelector from "@/components/CitySelector";
import PriceCard from "@/components/PriceCard";
import { Fuel, Shield, AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

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
  
  const [prices, setPrices] = useState<PriceRow[]>([]);
  
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
      setPrices([]);
      return;
    }

    async function fetchCities() {
      setLoadingCities(true);
      setSelectedCitySlug("");
      setPrices([]);
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
      setPrices([]);
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
          .limit(5); // Fetch up to 5 days (latest + previous 4 days)

        if (dbError) throw dbError;

        setPrices(data || []);
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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-zinc-800 selection:text-zinc-200">
      {/* Container */}
      <div className="max-w-3xl w-full mx-auto px-4 py-12 md:py-20 flex-grow">
        
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 mb-4 text-zinc-400 text-xs font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-zinc-400"></span>
            </span>
            <span>Daily Updates</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 flex items-center justify-center gap-2.5">
            <Fuel className="w-8 h-8 text-zinc-300" />
            Fuel Price Tracker
          </h1>
          <p className="mt-2.5 text-zinc-400 max-w-sm mx-auto text-xs md:text-sm">
            Daily updated Petrol and Diesel prices across major cities in India.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Controls Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row gap-5 items-end">
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
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            <p className="text-xs text-zinc-500">Fetching fuel rates...</p>
          </div>
        )}

        {/* Price Card Results */}
        {!loadingPrices && prices.length > 0 && (
          <PriceCard
            prices={prices}
            cityName={selectedCityName}
          />
        )}

        {/* Empty state (when city is selected but no data is in DB) */}
        {!loadingPrices && selectedCitySlug && prices.length === 0 && (
          <div className="mt-6 p-8 bg-zinc-900/10 border border-zinc-800 rounded-xl border-dashed text-center flex flex-col items-center justify-center gap-2.5">
            <HelpCircle className="w-8 h-8 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-300">No rates available for {selectedCityName}</h3>
            <p className="text-xs text-zinc-500 max-w-xs">
              Prices for this city haven't been scraped yet. Please run the daily scraper to fetch rates.
            </p>
          </div>
        )}

        {/* Welcome / Instruction state */}
        {!selectedCitySlug && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-zinc-400 text-xs">
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg flex flex-col gap-1.5">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Step 1</span>
              <p className="text-zinc-500 leading-relaxed">
                Choose a State from the dropdown to load its urban centers.
              </p>
            </div>
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg flex flex-col gap-1.5">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Step 2</span>
              <p className="text-zinc-500 leading-relaxed">
                Select a City from the list. We track the major cities in each state.
              </p>
            </div>
            <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-lg flex flex-col gap-1.5">
              <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Step 3</span>
              <p className="text-zinc-500 leading-relaxed">
                Analyze today's prices and view price trends for the past 4 days.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/60 py-5 text-center text-[11px] text-zinc-500">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-zinc-700" />
            <span>Secure connection via Supabase client</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} Fuel Price Tracker.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
