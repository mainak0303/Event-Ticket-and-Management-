import { QueryClient, useQueryClient } from "@tanstack/react-query";

interface GlobalHooks {
    queryClient: QueryClient
}

export const useGlobalHooks = (): GlobalHooks => {
    const queryClient = useQueryClient()

    return {
        queryClient
    }
}