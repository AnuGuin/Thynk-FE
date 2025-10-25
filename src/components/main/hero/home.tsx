"use client"

import React from "react"
import MarketSidebar from "../market/sidebar"

export default function HomeHero() {
  return (
    <div className="flex h-screen w-full bg-white dark:bg-neutral-900">
      <MarketSidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">
          Hero Home
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300">
          This page imports the Market sidebar component with native animations.
        </p>
      </main>
    </div>
  )
}