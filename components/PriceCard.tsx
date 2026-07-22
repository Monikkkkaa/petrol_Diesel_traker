"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Calendar, Fuel, TrendingUp, ChevronRight } from "lucide-react";

interface PriceRow {
  id: number;
  city_slug: string;
  date: string;
  petrol_price: number;
  diesel_price: number;
  scraped_at: string;
}

interface PriceCardProps {
  prices: PriceRow[];
  cityName: string;
}

export default function PriceCard({ prices, cityName }: PriceCardProps) {
  if (!prices || prices.length === 0) return null;

  const currentPrice = prices[0];
  const previousPrice = prices[1]; // Yesterday's price for delta

  // Calculate delta details
  const getDiffDetails = (curr: number, prev?: number, isTextOnly = false) => {
    if (prev === undefined || prev === null) {
      return { text: "N/A", color: "text-zinc-400", icon: null };
    }
    
    const diff = curr - prev;
    const formattedDiff = Math.abs(diff).toFixed(2);
    
    if (diff > 0) {
      return {
        text: `+₹${formattedDiff}`,
        color: isTextOnly ? "text-red-500" : "text-red-500 bg-red-500/5 border-red-500/10",
        icon: <ArrowUpRight className="w-3 h-3" />,
      };
    } else if (diff < 0) {
      return {
        text: `-₹${formattedDiff}`,
        color: isTextOnly ? "text-emerald-500" : "text-emerald-500 bg-emerald-500/5 border-emerald-500/10",
        icon: <ArrowDownRight className="w-3 h-3" />,
      };
    } else {
      return {
        text: "0.00",
        color: isTextOnly ? "text-zinc-500" : "text-zinc-500 bg-zinc-500/5 border-zinc-500/10",
        icon: <Minus className="w-3 h-3" />,
      };
    }
  };

  const petrolDiff = getDiffDetails(currentPrice.petrol_price, previousPrice?.petrol_price);
  const dieselDiff = getDiffDetails(currentPrice.diesel_price, previousPrice?.diesel_price);

  // Format date nicely (e.g. 21 Jul 2026)
  const formatDate = (dateStr: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-IN", options);
    } catch {
      return dateStr;
    }
  };

  // Get historical prices (up to 4 days, excluding today)
  const historyList = prices.slice(1, 5);

  return (
    <div className="w-full mt-6 animate-fade-in">
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        
        {/* Main Price Info Panel */}
        <div className="p-6 md:p-8">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                {cityName}
              </h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">
                Current fuel prices for this region
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500 bg-zinc-800/40 border border-zinc-700/30 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-zinc-500" />
                Latest: {formatDate(currentPrice.date)}
              </span>
            </div>
          </div>

          {/* Pricing Row - Unified & Symmetrical Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800/60 gap-6 md:gap-0">
            {/* Petrol Panel */}
            <div className="md:pr-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/50 border border-zinc-700/20 flex items-center justify-center text-zinc-400">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-200 text-sm">Petrol Rate</h3>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Premium / Normal</p>
                  </div>
                </div>
                
                {previousPrice && (
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${petrolDiff.color}`}>
                    {petrolDiff.icon}
                    <span>{petrolDiff.text}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[22px] font-medium text-zinc-500 mr-1">₹</span>
                <span className="text-4xl font-bold text-zinc-50 tracking-tight">
                  {Number(currentPrice.petrol_price).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 ml-1">/ Litre</span>
              </div>
            </div>

            {/* Diesel Panel */}
            <div className="pt-6 md:pt-0 md:pl-8 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-800/50 border border-zinc-700/20 flex items-center justify-center text-zinc-400">
                    <Fuel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-200 text-sm">Diesel Rate</h3>
                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-0.5">Heavy / Normal</p>
                  </div>
                </div>
                
                {previousPrice && (
                  <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${dieselDiff.color}`}>
                    {dieselDiff.icon}
                    <span>{dieselDiff.text}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-[22px] font-medium text-zinc-500 mr-1">₹</span>
                <span className="text-4xl font-bold text-zinc-50 tracking-tight">
                  {Number(currentPrice.diesel_price).toFixed(2)}
                </span>
                <span className="text-xs text-zinc-500 ml-1">/ Litre</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Pricing History Section */}
        {historyList.length > 0 && (
          <div className="bg-zinc-950/40 border-t border-zinc-800/60 p-6 md:p-8">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-6">
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
              Price Timeline (Previous 4 Days)
            </h4>
            
            {/* Timeline Tree Component */}
            <div className="relative border-l border-zinc-800 ml-3 pl-6 space-y-6 py-1">
              {historyList.map((hist, idx) => {
                const nextHist = prices[idx + 2]; // Compare with the day after it in the list
                const pDiff = getDiffDetails(hist.petrol_price, nextHist?.petrol_price, true);
                const dDiff = getDiffDetails(hist.diesel_price, nextHist?.diesel_price, true);
                
                return (
                  <div key={hist.id || idx} className="relative group">
                    {/* Circle Node indicator */}
                    <div className="absolute -left-[30px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-zinc-400 transition-colors border border-zinc-950" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-zinc-400 font-medium text-sm">
                        <span>{formatDate(hist.date)}</span>
                        <ChevronRight className="w-3 h-3 text-zinc-500" />
                      </div>
                      
                      {/* Price values for the historical day */}
                      <div className="flex items-center gap-6 sm:gap-8 text-xs font-bold text-zinc-100">
                        {/* Petrol */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-zinc-500 font-semibold text-[10px] uppercase">Petrol:</span>
                          <span>₹{Number(hist.petrol_price).toFixed(2)}</span>
                          {nextHist && (
                            <span className="text-[10px] font-medium flex items-center">
                              {pDiff.text}
                            </span>
                          )}
                        </div>
                        
                        {/* Diesel */}
                        <div className="flex items-center gap-2.5">
                          <span className="text-zinc-500 font-semibold text-[10px] uppercase">Diesel:</span>
                          <span>₹{Number(hist.diesel_price).toFixed(2)}</span>
                          {nextHist && (
                            <span className="text-[10px] font-medium flex items-center">
                              {dDiff.text}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
