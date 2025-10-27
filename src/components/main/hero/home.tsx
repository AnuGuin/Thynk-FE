"use client"

import React, { useEffect, useState } from "react"
import { MarketCard } from "@/components/main/misc/market-card"
import { MarketHeroCarousel } from "@/components/main/misc/hero-carousal"

interface MarketRow {
  market_id: number
}

export default function HomeHero() {
  const [markets, setMarkets] = useState<MarketRow[] | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    const fetchMarkets = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/markets')
        if (!res.ok) {
          console.error('Failed to fetch markets list')
          if (mounted) setMarkets([])
          return
        }

        const data = await res.json()
        if (mounted) setMarkets(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Error fetching markets:', err)
        if (mounted) setMarkets([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchMarkets()

    return () => { mounted = false }
  }, [])

  // Listen for optimistic market creations and prepend to list
  useEffect(() => {
    const handler = (e: Event) => {
      try {
        const custom = e as CustomEvent
        const newMarket = custom.detail as MarketRow & Partial<Record<string, unknown>>
        setMarkets(prev => {
          if (!prev) return [newMarket]
          // avoid duplicates
          if (prev.find((m) => m.market_id === newMarket.market_id)) return prev
          return [newMarket, ...prev]
        })
      } catch (err) {
        console.error('Failed to handle market:created event', err)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('market:created', handler)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('market:created', handler)
      }
    }
  }, [])

  return (
    <div className="flex h-full w-full bg-white dark:bg-neutral-900">
      <main className="flex-1 p-0 overflow-hidden">
        <div className="w-full">
          {/* Carousel beneath navbar */}
          <div className="mb-8">
            <MarketHeroCarousel />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white">Markets</h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">All markets (active, pending, and resolved)</p>
          </div>

          {loading ? (
            <p className="text-neutral-600 dark:text-neutral-400">Loading markets...</p>
          ) : (!markets || markets.length === 0) ? (
            <div className="py-12 text-center">
              <p className="text-lg text-neutral-600 dark:text-neutral-400">No markets yet. Propose one using the button in the navbar.</p>
            </div>
          ) : (
            <div className="grid gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <MarketCard key={m.market_id} index={m.market_id} filter={'all'} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}