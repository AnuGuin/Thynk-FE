'use client'

import { useReadContract } from 'thirdweb/react'
import { contract } from '@/constant/contract'
import { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image"
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Interface for the market data
interface Market {
  question: string
  optionA: string
  optionB: string
  endTime: bigint
  outcome: number
  totalOptionAShares: bigint
  totalOptionBShares: bigint
  resolved: boolean
  feesForCreator: bigint
}

export function MarketHeroCarousel() {
  const [randomMarkets, setRandomMarkets] = useState<number[]>([])
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  const { data: marketCount, isLoading: isLoadingMarketCount } = useReadContract({
    contract,
    method: "function marketCount() view returns (uint256)",
    params: [],
  })

  // Generate 4 random market indices when marketCount is available
  useEffect(() => {
    if (marketCount && Number(marketCount) > 0) {
      const count = Number(marketCount)
      const indices: number[] = []
      
      // Get up to 4 random unique indices
      while (indices.length < Math.min(4, count)) {
        const randomIndex = Math.floor(Math.random() * count)
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex)
        }
      }
      
      setRandomMarkets(indices)
    }
  }, [marketCount])

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const images = ['c1.jpg', 'c2.jpg', 'c3.jpg', 'c4.jpg']

  if (isLoadingMarketCount || randomMarkets.length === 0) {
    return (
      <div className="w-full h-[450px] bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg animate-pulse" />
    )
  }

  return (
    <Carousel
      setApi={setApi}
      opts={{
        loop: true,
        slidesToScroll: 1,
      }}
      plugins={[
        Autoplay({
          delay: 3000,
        }),
      ]}
      className="w-full max-w-8xl mx-auto"
    >
      <CarouselContent className="flex h-[450px] w-full">
        {randomMarkets.map((marketIndex, idx) => (
          <CarouselItem key={marketIndex} className="relative flex h-[81.5%] w-full basis-[73%] items-center justify-center sm:basis-[50%] md:basis-[30%] lg:basis-[25%] xl:basis-[21%]">
            <motion.div
              initial={false}
              animate={{
                clipPath:
                  current !== idx
                    ? "inset(15% 0 15% 0 round 2rem)"
                    : "inset(0 0 0 0 round 2rem)",
              }}
              className="h-full w-full overflow-hidden rounded-3xl"
            >
              <CarouselSlide 
                marketIndex={marketIndex} 
                imageUrl={`/${images[idx % images.length]}`}
              />
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="absolute -bottom-4 right-0 flex w-full items-center justify-between gap-2 px-4">
        <button
          aria-label="Previous slide"
          onClick={() => api?.scrollPrev()}
          className="rounded-full bg-black/10 p-2"
        >
          <ChevronLeft className="text-white" />
        </button>
        <button
          aria-label="Next slide"
          onClick={() => api?.scrollNext()}
          className="rounded-full bg-black/10 p-2"
        >
          <ChevronRight className="text-white" />
        </button>
      </div>

      <div className="flex w-full items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: randomMarkets.length }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 w-2 cursor-pointer rounded-full transition-all",
                current === index ? "bg-black" : "bg-[#D9D9D9]",
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Carousel>
  )
}

interface CarouselSlideProps {
  marketIndex: number
  imageUrl: string
}

function CarouselSlide({ marketIndex, imageUrl }: CarouselSlideProps) {
  const { data: marketData } = useReadContract({
    contract,
    method: "function getMarketInfo(uint256 _marketId) view returns (string question, string optionA, string optionB, uint256 endTime, uint8 outcome, uint256 totalOptionAShares, uint256 totalOptionBShares, bool resolved, uint256 feesForCreator)",
    params: [BigInt(marketIndex)],
  })

  const market: Market | undefined = marketData ? {
    question: marketData[0],
    optionA: marketData[1],
    optionB: marketData[2],
    endTime: marketData[3],
    outcome: marketData[4],
    totalOptionAShares: marketData[5],
    totalOptionBShares: marketData[6],
    resolved: marketData[7],
    feesForCreator: marketData[8]
  } : undefined

  const formatTimeLeft = (endTime: bigint) => {
    const now = new Date().getTime()
    const end = Number(endTime) * 1000
    const diff = end - now

    if (diff <= 0) {
      return "Ended"
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h left`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`
    } else {
      return `${minutes}m left`
    }
  }

  if (!market) {
    return (
      <Card className="border-0">
        <CardContent className="p-0">
          <div className="relative w-full h-full bg-linear-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative w-full h-full">
          {/* Background Image */}
          <Image
            src={imageUrl}
            alt="Market banner"
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = '/defaultimg.jpg'
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-transparent" />
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            {/* Time Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {formatTimeLeft(market.endTime)}
                </span>
              </div>
            </div>
            
            {/* Market Question */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 line-clamp-2">
              {market.question}
            </h2>
            
            {/* Options */}
            <div className="flex flex-wrap gap-2">
              <div className="px-4 py-2 rounded-lg bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30">
                <span className="text-sm font-medium text-emerald-100">
                  {market.optionA}
                </span>
              </div>
              <span className="text-white/60 self-center">vs</span>
              <div className="px-4 py-2 rounded-lg bg-rose-500/20 backdrop-blur-sm border border-rose-400/30">
                <span className="text-sm font-medium text-rose-100">
                  {market.optionB}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
