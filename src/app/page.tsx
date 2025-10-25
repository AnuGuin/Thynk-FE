"use client"

import React from "react"
import AppLayout from "../components/app-layout/app-layout"

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
            Welcome to Thynk
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-300">
            Your prediction market platform with seamless navigation
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Example cards */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-750"
            >
              <h3 className="font-semibold text-neutral-800 dark:text-white">
                Market {item}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                Sample market card content
              </p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}