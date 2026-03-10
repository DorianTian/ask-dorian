import useSWR, { type SWRConfiguration } from "swr"
import type { ApiResult } from "../api/client"

// ---------------------------------------------------------------------------
// Generic SWR wrapper for ApiResult<T>
//
// Unwraps the discriminated union: throws on error (SWR catches it),
// returns data on success. This keeps component code clean:
//   const { data, error, isLoading } = useSWRApi(key, fetcher)
// ---------------------------------------------------------------------------

export function useSWRApi<T>(
  key: string | null,
  fetcher: () => Promise<ApiResult<T>>,
  config?: SWRConfiguration<T>,
) {
  return useSWR<T>(
    key,
    async () => {
      const result = await fetcher()
      if (!result.ok) {
        throw result.error
      }
      return result.data
    },
    {
      revalidateOnFocus: false,
      ...config,
    },
  )
}
