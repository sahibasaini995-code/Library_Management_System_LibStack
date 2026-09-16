"use client"

import { useState, useCallback } from "react"
import { ApiError } from "@/lib/api"

interface UseApiState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

export function useApi<T>(apiFunction: (...args: any[]) => Promise<T>): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const result = await apiFunction(...args)
        setState({ data: result, isLoading: false, error: null })
        return result
      } catch (err) {
        const errorMessage = err instanceof ApiError ? err.message : "An unexpected error occurred"
        setState({ data: null, isLoading: false, error: errorMessage })
        return null
      }
    },
    [apiFunction],
  )

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}
