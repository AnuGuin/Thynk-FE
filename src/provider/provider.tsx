"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThirdwebProvider } from "thirdweb/react"

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: "class" | "data-theme"
  defaultTheme?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Create a stable QueryClient instance per session to be used by
  // thirdweb/react hooks and other react-query consumers.
  const [queryClient] = React.useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          // don't refetch on window focus by default
          refetchOnWindowFocus: false,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}
