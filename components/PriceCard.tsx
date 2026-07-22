"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, Calendar, Fuel } from "lucide-react";

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
  const getDiffDetails = (curr: number, prev?: number) => {
    if (prev === undefined || prev === null) {
      return { text: "N/A", color: "text-zinc-500 bg-zinc-100 dark:bg-zinc-800/40", icon: null };
    }
    
    const diff = curr - prev;
    const formattedDiff = Math.abs(diff).toFixed(2);
    
    if (diff > 0) {
      return {
        text: `+₹${formattedDiff}`,
        color: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-200 dark:border-red-900/30",
        icon: <ArrowUpRight className="w-3.5 h-3.5" />,
      };
    } else if (diff < 0) {
      return {
        text: `-₹${formattedDiff}`,
        color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border-green-200 dark:border-green-900/30",
        icon: <ArrowDownRight className="w-3.5 h-3.5" />,
      };
    } else {
      return {
        text: "No change",
        color: "text-zinc-500 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/30",
        icon: <Minus className="w-3.5 h-3.5" />,
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
    <div className="w-full mt-8 animate-fade-in">
      {/* Container - Clean Flat Minimalist Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Live Rates
            </span>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {cityName}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span>{formatDate(currentPrice.date)}</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Petrol Card */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">
                  <Fuel className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Petrol</h3>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">Per Litre</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${petrolDiff.color}`}>
                {petrolDiff.icon}
                <span>{petrolDiff.text}</span>
              </div>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                ₹{Number(currentPrice.petrol_price).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Diesel Card */}
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-zinc-200/50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg">
                  <Fuel className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">Diesel</h3>
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase font-medium">Per Litre</p>
                </div>
              </div>
              
              <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${dieselDiff.color}`}>
                {dieselDiff.icon}
                <span>{dieselDiff.text}</span>
              </div>
            </div>
            
            <div className="flex items-baseline">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                ₹{Number(currentPrice.diesel_price).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Historical Price Section (Past 4 Days) */}
        {historyList.length > 0 && (
          <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-5">
            <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Price History (Past 4 Days)
            </h4>
            
            <div className="overflow-hidden border border-zinc-100 dark:border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="px-4 py-2.5 font-semibold">Date</th>
                    <th className="px-4 py-2.5 font-semibold">Petrol Price</th>
                    <th className="px-4 py-2.5 font-semibold">Diesel Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {historyList.map((hist, idx) => (
                    <tr key={hist.id || idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-colors">
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400 font-medium">
                        {formatDate(hist.date)}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-bold">
                        ₹{Number(hist.petrol_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-800 dark:text-zinc-200 font-bold">
                        ₹{Number(hist.diesel_price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
