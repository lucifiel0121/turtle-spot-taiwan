import type { ReactNode } from "react";
import { SWRConfig } from "swr";

/**
 * 每個測試給全新 SWR cache（provider: new Map），避免跨測試共用快取汙染；
 * dedupingInterval: 0 讓每次 render 都真的觸發 revalidate。
 */
export function createSwrWrapper() {
  return function Wrapper({ children }: { readonly children: ReactNode }) {
    return (
      <SWRConfig
        value={{
          provider: () => new Map(),
          dedupingInterval: 0,
          shouldRetryOnError: false,
        }}
      >
        {children}
      </SWRConfig>
    );
  };
}
