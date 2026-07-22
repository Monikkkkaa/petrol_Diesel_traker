"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Calendar, Fuel, Clock } from "lucide-react";

interface PriceRow {
  id: number;
  city_slug: string;
  date: string;
  petrol_price: number;
  diesel_price: number;
  scraped_at: string;
}

interface PriceCardProps {
  currentPrice: PriceRow;
  previousPrice?: PriceRow;
  cityName: string;
}

export default function PriceCard({
  currentPrice,
  previousPrice,
  cityName,
}: PriceCardProps) {
  const getDiffDetails = (curr: number, prev?: number) => {
    if (prev === undefined || prev === null) {
      return { text: "N/A", color: "text-zinc-500 bg-zinc-900/40", icon: null };
    }
    
    const diff = curr - prev;
    const formattedDiff = Math.abs(diff).toFixed(2);
    
    if (diff > 0) {
      return {
        text: `+₹${formattedDiff}`,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        icon: <ArrowUpRight className="w-3.5 h-3.5" />,
      };
    } else if (diff < 0) {
      return {
        text: `-₹${formattedDiff}`,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        icon: <ArrowDownRight className="w-3.5 h-3.5" />,
      };
    } else {
      return {
        text: "No change",
        color: "text-zinc-400 bg-zinc-800/30 border-zinc-700/20",
        icon: <Minus className="w-3.5 h-3.5" />,
      };
    }
  };

  const petrolDiff = getDiffDetails(currentPrice.petrol_price, previousPrice?.petrol_price);
  const dieselDiff = getDiffDetails(currentPrice.diesel_price, previousPrice?.diesel_price);

  // Format date nicely (e.g. 21 Jul, 2026)
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-IN", options);
    } catch {
      return dateStr;
    }
  };

  // Format timestamp (e.g., 22 Jul 2026 12:00 PM)
  const formatDateTime = (tsStr: string) => {
    try {
      const date = new Date(tsStr);
      const dateFormatted = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
      const timeFormatted = date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
      return `${dateFormatted} at ${timeFormatted}`;
    } catch {
      return tsStr;
    }
  };

  return (
    <div className="w-full mt-8 animate-fade-in">
      <div className="relative overflow-hidden bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5 mb-6">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Live Rates
            </span>
            <h2 className="text-2xl font-bold text-zinc-100 tracking-tight mt-0.5">
              {cityName}
            </h2>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5 bg-zinc-950/40 px-3 py-1.5 rounded-lg border border-zinc-800/30">
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
              <span>{formatDate(currentPrice.date)}</span>
            </div>
            
            {previousPrice && (
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-zinc-500">Compared to:</span>
                <span className="font-medium text-zinc-300">{formatDate(previousPrice.date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Petrol Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg group hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200">Petrol Price</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Per Litre</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${petrolDiff.color}`}>
                {petrolDiff.icon}
                <span>{petrolDiff.text}</span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                ₹{Number(currentPrice.petrol_price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Diesel Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 border border-zinc-800/50 rounded-xl p-5 shadow-lg group hover:border-zinc-700/60 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none transition-all duration-300 group-hover:scale-110" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                  <Fuel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200">Diesel Price</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Per Litre</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${dieselDiff.color}`}>
                {dieselDiff.icon}
                <span>{dieselDiff.text}</span>
              </div>
            </div>
            
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-zinc-100 tracking-tight">
                ₹{Number(currentPrice.diesel_price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-5 pt-4 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-600" />
            <span>Last scraped: {formatDateTime(currentPrice.scraped_at)}</span>
          </div>
          <div>
            <span>Data sourced from Cardekho</span>
          </div>
        </div>
      </div>
    </div>
  );
}
