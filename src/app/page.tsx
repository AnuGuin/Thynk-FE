"use client"

import React from "react"
import AppLayout from "../components/app-layout/app-layout"
import HomeHero from "@/components/main/hero/home"

export default function HomePage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <HomeHero />
      </div>
    </AppLayout>
  )
}