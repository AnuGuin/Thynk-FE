"use client"

import React, { useState, useEffect } from "react"
import AppLayout from "@/components/app-layout/app-layout"
import SmoothTab from "@/components/ui/smooth-tab"
import SortComponent from "@/components/main/misc/market-sort"
import { MarketCard } from "@/components/main/misc/market-card"
import { ProposeMarketForm } from "@/components/main/misc/propose-market"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useReadContract } from "thirdweb/react"
import { contract } from "@/constant/contract"

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'resolved'>('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [filterTag, setFilterTag] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Get total number of markets
  const { data: marketCount, refetch: refetchMarketCount } = useReadContract({
    contract,
    method: "function nextMarketId() view returns (uint256)",
    params: [],
  })

  const totalMarkets = marketCount ? Number(marketCount) : 0

  // Auto-refresh market count every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchMarketCount()
    }, 5000)
    return () => clearInterval(interval)
  }, [refetchMarketCount])

  const handleMarketCreated = () => {
    setRefreshKey(prev => prev + 1)
    refetchMarketCount()
  }

  const handleSortChange = (sort: { tag?: string; timing?: string }) => {
    if (sort.tag) setFilterTag(sort.tag)
    if (sort.timing) setSortBy(sort.timing.toLowerCase())
  }

  // Generate array of market indices (newest first by default)
  const getMarketIndices = () => {
    const indices = Array.from({ length: totalMarkets }, (_, i) => totalMarkets - 1 - i)
    
    // Apply timing sort
    if (sortBy === 'oldest') {
      return indices.reverse()
    }
    // For 'trending' and 'ending', we'll rely on the natural order for now
    // You can implement more complex sorting logic based on volume or end time
    
    return indices
  }

  const marketIndices = getMarketIndices()

  return (
    <AppLayout>
      <div className="flex h-full flex-col space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">
              Markets
            </h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              Browse and trade on prediction markets
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-linear-to-r from-purple-500 to-pink-500 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Market
          </Button>
        </div>

        {/* Smooth Tabs and Sort */}
        <div className="flex items-start justify-between gap-4">
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
            {marketIndices.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  No markets yet. Be the first to create one!
                </p>
              </div>
            ) : (
              marketIndices.map((index) => (
                <MarketCard
                  key={`${index}-${refreshKey}`}
                  index={index}
                  filter={activeTab}
                />
              ))
            )}
          </div>
        </div>

        {/* Propose Market Modal */}
        <ProposeMarketForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onMarketCreated={handleMarketCreated}
        />
      </div>
    </AppLayout>
  )
}