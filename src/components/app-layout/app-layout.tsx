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
    <>
      <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-neutral-900">
      {/* Sidebar - persists across navigation */}
      <MarketSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      
  {/* Main Content Area */}
  {/* Add min-h-0 so children with overflow can be sized correctly inside the flex column */}
  <div className="flex flex-1 flex-col min-h-0 min-w-0">
        {/* Navbar - persists across navigation */}
        <MarketNavbar onSearch={handleSearch} />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto min-w-0 w-full">
          <div className="w-full bg-white p-6 md:p-10 dark:bg-neutral-900">
            {children}
          </div>
        </main>
      </div>
      </div>
    </>
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