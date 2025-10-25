"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

interface LayoutContextType {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

export const useLayout = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider")
  }
  return context
}

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <LayoutContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </LayoutContext.Provider>
  )
}