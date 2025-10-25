"use client"

import React from "react"
import MarketSidebar from "../main/market/market-sidebar"
import MarketNavbar from "../main/market/market-navbar"
import { LayoutProvider, useLayout } from "../../context/layout-context"


interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayoutContent: React.FC<AppLayoutProps> = ({ children }) => {
  const { sidebarOpen, setSidebarOpen } = useLayout();

  const handleSearch = (searchTerm: string) => {
    console.log("Searching for:", searchTerm)
    // Add your search logic here
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-neutral-800">
      {/* Sidebar - persists across navigation */}
      <MarketSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Navbar - persists across navigation */}
        <MarketNavbar onSearch={handleSearch} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full bg-white p-6 md:p-10 dark:bg-neutral-900">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <LayoutProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </LayoutProvider>
  )
}

export default AppLayout