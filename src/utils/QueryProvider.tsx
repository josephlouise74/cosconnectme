"use client"

import { Toaster } from '@/components/ui/sonner';
import {
    QueryClient,
    QueryClientProvider
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({
    children
}: {
    children: React.ReactNode
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000, // 1 minute
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: 2,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={true} />
            <Toaster />
        </QueryClientProvider>
    )
}