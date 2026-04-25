import { ReactNode, useEffect } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import { useAuthStore } from "@/store/auth.store"
import { LoadingState } from "@/components/ui/LoadingState"

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const hydrate = useAuthStore((state) => state.hydrate)
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    hydrate().catch(() => {})
  }, [hydrate])

  return (
    <QueryClientProvider client={queryClient}>
      {status === "loading" ? <LoadingState label="Waking your tin..." /> : children}
    </QueryClientProvider>
  )
}
