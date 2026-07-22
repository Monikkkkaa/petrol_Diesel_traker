"use client";

import React from "react";
import { Navigation } from "lucide-react";

interface CitySelectorProps {
  cities: { slug: string; name: string }[];
  selectedCitySlug: string;
  onChange: (slug: string) => void;
  loading: boolean;
  disabled: boolean;
}

export default function CitySelector({
  cities,
  selectedCitySlug,
  onChange,
  loading,
  disabled,
}: CitySelectorProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label
        htmlFor="city-select"
        className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5"
      >
        <Navigation className="w-3.5 h-3.5 text-indigo-400" />
        Select City
      </label>
      <div className="relative">
        <select
          id="city-select"
          value={selectedCitySlug}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || loading}
          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl px-4 py-3.5 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 appearance-none text-sm md:text-base font-medium shadow-inner"
        >
          <option value="" className="bg-zinc-950 text-zinc-400">
            {loading ? "Loading cities..." : disabled ? "First select a state" : "-- Choose City --"}
          </option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug} className="bg-zinc-950 text-zinc-200">
              {city.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-zinc-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
