"use client"

import React from "react"
import MarketSidebar from "../components/main/market/sidebar"


export default function HomeHero() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
      <MarketSidebar />
      <div className="flex flex-1">
        <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
          <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
            Hero Home
          </h1>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">
            This page imports the Market sidebar component with smooth native animations.
          </p>
        </div>
      </div>
    </div>
  )
}