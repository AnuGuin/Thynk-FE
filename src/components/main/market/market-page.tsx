"use client"

import React, { useEffect, useState } from "react"
import AppLayout from "../../app-layout/app-layout"


export default function MarketPage() {
  const [marketData, setMarketData] = useState(() =>
    [1, 2, 3, 4, 5].map((item) => ({
      id: item,
      percentage: Math.floor(Math.random() * 100)
    }))
  )

  // initial percentages are set in the useState initializer; no effect needed

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Markets
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Browse and trade on prediction markets
          </p>
        </div>

        <div className="space-y-4">
          {/* Example market listings */}
          {marketData.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">
                    Market Question {item.id}
                  </h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    This is a sample market description. Users can bet on the outcome of this prediction.
                  </p>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {item.percentage}%
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Yes probability
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}