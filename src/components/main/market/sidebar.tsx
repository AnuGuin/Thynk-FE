"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Sidebar, SidebarBody, SidebarLink } from "../../ui/sidebar"
import Icons from "../../logos/logo"
import { motion } from "motion/react"

const links = [
  { label: "Home", href: "/", icon: <Icons.HomeLight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Market", href: "/market", icon: <Icons.MarketLight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Add Market", href: "/market/add", icon: <Icons.AddMarketLight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
  { label: "Leaderboard", href: "/leaderboard", icon: <Icons.LeaderBoardLight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" /> },
]

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-10 w-10 shrink-0 text-neutral-700 dark:text-neutral-200">
        <Image
          src="/2-lightlogo.png"
          alt="Thynk logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre text-xl font-semibold text-neutral-800 dark:text-white"
        style={{ fontFamily: 'IntroRust, sans-serif' }}
      >
        Thynk
      </motion.span>
    </Link>
  )
}

const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
    >
      <div className="h-10 w-10 shrink-0 text-neutral-700 dark:text-neutral-200">
        <Image
          src="/2-lightlogo.png"
          alt="Thynk logo"
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
        />
      </div>
    </Link>
  )
}

export const MarketSidebar: React.FC<{
  className?: string
  open?: boolean
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
}> = ({ className, open, setOpen }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  
  return (
    <Sidebar open={open ?? sidebarOpen} setOpen={setOpen ?? setSidebarOpen}>
      <SidebarBody className={cn("justify-between gap-12", className)}>
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {(open ?? sidebarOpen) ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

export default MarketSidebar