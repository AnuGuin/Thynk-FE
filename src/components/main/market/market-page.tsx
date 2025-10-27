"use client"

import React, { useState, useEffect } from "react"
import AppLayout from "@/components/app-layout/app-layout"
import SmoothTab from "@/components/ui/smooth-tab"
import SortComponent from "@/components/main/misc/market-sort"
import { MarketCard } from "@/components/main/misc/market-card"
import { useReadContract } from "thirdweb/react"
import { contract } from "@/constant/contract"

const CATEGORIES = [
  { id: '', label: 'All Markets', bgImage: '/defaultimg.jpg', bgColor: 'bg-gradient-to-br from-purple-400 to-pink-400' },
  { id: 'crypto', label: 'Crypto', bgImage: '/c1.jpg', bgColor: 'bg-gradient-to-br from-pink-300 to-purple-300' },
  { id: 'sports', label: 'Sports', bgImage: '/c2.jpg', bgColor: 'bg-gradient-to-br from-cyan-300 to-blue-300' },
  { id: 'politics', label: 'Politics', bgImage: '/c3.jpg', bgColor: 'bg-gradient-to-br from-purple-300 to-indigo-300' },
  { id: 'economy', label: 'Economy', bgImage: '/c4.jpg', bgColor: 'bg-gradient-to-br from-green-300 to-emerald-400' },
  { id: 'gaming', label: 'Gaming', bgImage: '/c5.jpg', bgColor: 'bg-gradient-to-br from-yellow-300 to-orange-300' },
  { id: 'culture', label: 'Culture', bgImage: '/defaultimg.jpg', bgColor: 'bg-gradient-to-br from-red-300 to-pink-300' },
  { id: 'sentiment', label: 'Sentiment', bgImage: '/defaultimg.jpg', bgColor: 'bg-gradient-to-br from-orange-200 to-yellow-200' },
]

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'resolved'>('active')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterTag, setFilterTag] = useState<string>('')
  const [markets, setMarkets] = useState<Array<{ id: number; question: string; optionA: string; optionB: string; endTime: bigint; outcome: number; totalOptionAShares: bigint; totalOptionBShares: bigint; resolved: boolean; feesForCreator: bigint; description: string; image_url: string; }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get total number of markets
  const { refetch: refetchMarketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: [],
  })

  // Auto-refresh market count every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMarketCount()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetchMarketCount])

  const handleSortChange = (sort: { timing?: string }) => {
    if (sort.timing) setSortBy(sort.timing.toLowerCase())
  }

  // Fetch markets data from the backend
  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/markets?status=${activeTab}&sort=${sortBy}&tag=${filterTag}`)
        if (!response.ok) {
          throw new Error('Failed to fetch markets')
        }
        const data = await response.json()
        setMarkets(data)
      } catch (error) {
        console.error('Error fetching markets:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarkets()
  }, [activeTab, sortBy, filterTag])

  return (
    <AppLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Category Cards with Background Images */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilterTag(category.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                filterTag === category.id
                  ? 'border-neutral-900 shadow-lg dark:border-white'
                  : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 dark:hover:border-neutral-500'
              }`}
              style={{ height: '140px' }}
            >
              {/* Background Image with Blur */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundImage: `url(${category.bgImage})` }}
              />
              <div className={`absolute inset-0 ${category.bgColor} opacity-60`} />
              <div className="absolute inset-0 backdrop-blur-[2px]" />
              
              {/* Label */}
              <div className="relative flex h-full items-end p-4">
                <span className="text-sm font-bold text-white drop-shadow-lg">
                  {category.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Status Tabs and Sort */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <SmoothTab
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab as 'active' | 'pending' | 'resolved')}
            />
          </div>
          <div className="shrink-0">
            <SortComponent onSortChange={handleSortChange} />
          </div>
        </div>

        {/* Market Cards Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid gap-6 pb-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  Loading markets...
                </p>
              </div>
            ) : markets.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  No markets yet. Be the first to create one!
                </p>
              </div>
            ) : (
              markets.map((market) => (
                <MarketCard
                  key={market.id}
                  market={market}
                  filter={activeTab}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}