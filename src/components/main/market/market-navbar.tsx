"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"
import { HoverBorderGradient } from "../../ui/hover-border-gradient"
import { ThemeToggle } from "../../../provider/theme-toggle"
import Link from "next/link"
import Icons from "../../logos/logo"

interface MarketNavbarProps {
  onSearch?: (searchTerm: string) => void
}

export const MarketNavbar: React.FC<MarketNavbarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleSignUp = () => {
    // Add your sign up logic here
    console.log("Sign up clicked")
  }

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-4 dark:bg-neutral-900 dark:text-white">
      {/* Search Bar */}
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 rounded-full" />
          <input
            type="text"
            placeholder="Search Thynk"
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-500 transition-colors focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-400 dark:focus:border-neutral-600 dark:focus:ring-neutral-700"
          />
          <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-neutral-300 bg-white px-2 py-0.5 text-xs text-neutral-500 md:inline-block dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
            /
          </kbd>
        </div>
      </div>

      {/* Add Market Button + Sign Up Button + Theme Toggle */}
      <div className="ml-4 flex items-center gap-3">
        <ThemeToggle />

        <Link href="/market/add" className="rounded-full">
          <HoverBorderGradient
            containerClassName="rounded-full"
            className="flex items-center space-x-2 bg-white px-4 py-2 text-sm font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
            aria-label="Add market"
          >
            <div className="flex items-center space-x-2">
              <Icons.AddMarketLight className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
              <span>Add Market</span>
            </div>
          </HoverBorderGradient>
        </Link>

        <HoverBorderGradient
          containerClassName="rounded-full"
          as="button"
          onClick={handleSignUp}
          className="flex items-center space-x-2 bg-white px-6 py-2 text-sm font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
          aria-label="Sign in"
        >
          <span>Sign In</span>
        </HoverBorderGradient>
      </div>
    </nav>
  )
}

export default MarketNavbar