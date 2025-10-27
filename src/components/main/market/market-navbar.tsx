"use client"

import React, { useState } from "react"
import { Search } from "lucide-react"
import { HoverBorderGradient } from "../../ui/hover-border-gradient"
import { ThemeToggle } from "../../../provider/theme-toggle"
// Link import removed; navbar opens modal instead of navigating to separate add page
import Icons from "../../logos/logo"
import { ProposeMarketForm } from "@/components/main/misc/propose-market"
import { useRouter, usePathname } from "next/navigation"
import { useConnectModal, useActiveAccount, useActiveWallet, useDisconnect, useWalletDetailsModal } from "thirdweb/react"
import { client } from "@/app/client"
import { signLoginPayload } from "thirdweb/auth"
import Link from "next/link"

interface MarketNavbarProps {
  onSearch?: (searchTerm: string) => void
}

export const MarketNavbar: React.FC<MarketNavbarProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setSearchTerm(value)
    if (onSearch) {
      onSearch(value)
    }
  }

  // Authentication handlers for thirdweb ConnectButton
  const handleLogin = async (params: { payload: Record<string, unknown>; signature: string }) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: params.payload,
          signature: params.signature,
        }),
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      console.log("Login successful:", data)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const getLoginPayload = async (params: { address: string; chainId: number }) => {
    try {
      const response = await fetch("/api/auth/payload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: params.address,
          chainId: params.chainId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get login payload")
      }

      const payload = await response.json()
      return payload
    } catch (error) {
      console.error("Get payload error:", error)
      throw error
    }
  }

  // Programmatic sign-in using thirdweb hooks (open connect modal, wait for connection, sign payload)
  const connectModal = useConnectModal()
  const activeAccount = useActiveAccount()
  const activeWallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const detailsModal = useWalletDetailsModal()
  
  
  const activeAccountRef = React.useRef(activeAccount)

  React.useEffect(() => {
    activeAccountRef.current = activeAccount
  }, [activeAccount])

  const waitForActiveAccount = async (timeout = 30000) => {
    const start = Date.now()
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        if (activeAccountRef.current && activeAccountRef.current.address) {
          clearInterval(interval)
          resolve()
        } else if (Date.now() - start > timeout) {
          clearInterval(interval)
          reject(new Error("Timed out waiting for wallet connection"))
        }
      }, 200)
    })
  }

  const handleSignIn = async () => {
    try {
      // If not connected, open the connect modal and wait
      if (!activeAccount || !activeAccount.address) {
        // open the connect modal programmatically with our client
        await connectModal?.connect?.({ client })
        await waitForActiveAccount()
      }

      const address = activeAccountRef.current?.address
  const chainId = (activeAccountRef.current as unknown as { chain?: { id?: number } })?.chain?.id

      if (!address) throw new Error("No connected address")

      // Request payload from the server
      const payload = await getLoginPayload({ address, chainId: chainId ?? 11142220 })

  // Sign the payload using thirdweb's sign helper (uses the active account)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - activeAccountRef.current matches thirdweb Account at runtime
  const { signature } = await signLoginPayload({ payload, account: activeAccountRef.current })

      if (!signature) throw new Error("Signing failed or was cancelled")

      // Complete login on server
      await handleLogin({ payload, signature })
    } catch (err) {
      console.error("Sign in error:", err)
    }
  }
  

  return (
    <>
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

      {/* Add Market Button + Wallet Icon + Theme Toggle */}
      <div className="ml-4 flex items-center gap-3">
        <ThemeToggle />

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-full"
          aria-label="Add market"
        >
          <HoverBorderGradient
            containerClassName="rounded-full"
            className="flex items-center space-x-2 bg-white px-4 py-2 text-sm font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
          >
            <div className="flex items-center space-x-2">
              <Icons.AddMarketLight className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
              <span>Propose Market</span>
            </div>
          </HoverBorderGradient>
        </button>

        {/* Add Juror Button */}
        <Link href="/jury" className="rounded-full bg-blue-500 text-white px-4 py-2 text-sm font-medium hover:bg-blue-600">
          Juror
        </Link>

        <ProposeMarketForm
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onMarketCreated={(createdMarket) => {
            // close modal and notify home via event (also navigate to home if not already there)
            setIsCreateModalOpen(false)
            try {
              if (typeof window !== 'undefined' && createdMarket) {
                // already dispatched from the form, but ensure it's available globally
                window.dispatchEvent(new CustomEvent('market:created', { detail: createdMarket }))
              }
            } catch (err) {
              console.warn('Failed to dispatch market:created event from navbar', err)
            }

            try {
              if (pathname !== '/') {
                router.push('/')
              } else {
                // if already on home, refresh to ensure full data sync
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                router.refresh?.()
              }
            } catch (err) {
              console.warn('Navigation after market creation failed:', err)
            }
          }}
        />

        {activeAccount?.address ? (
          <button
            onClick={() =>
              detailsModal.open({
                client,
                theme: "dark",
                onDisconnect: async () => {
                  try {
                    await fetch("/api/auth/logout", { method: "POST" })
                  } catch (err) {
                    console.error("Logout API error:", err)
                  }

                  try {
                    if (activeWallet) await disconnect(activeWallet)
                  } catch (err) {
                    console.error("Disconnect error:", err)
                  }
                },
              })
            }
            aria-label="Open wallet"
            className="rounded-full bg-neutral-200 dark:bg-neutral-700 h-10 w-10 flex items-center justify-center"
          >
            <div className="h-6 w-6 bg-neutral-900 dark:bg-white rounded-full" />
          </button>
        ) : (
          <HoverBorderGradient
            containerClassName="rounded-full"
            as="button"
            onClick={handleSignIn}
            className="flex items-center space-x-2 bg-white px-6 py-2 text-sm font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
            aria-label="Sign in"
          >
            <span>Sign In</span>
          </HoverBorderGradient>
        )}
      </div>
    </nav>
    </>
  )
}

export default MarketNavbar