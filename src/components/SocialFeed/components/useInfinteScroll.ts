"use client"
import { useCallback, useRef } from 'react'

const useInfiniteScroll = (
    callback: () => void,
    hasNextPage: boolean,
    isFetching: boolean
) => {
    const observer = useRef<IntersectionObserver | null>(null)

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isFetching) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0]?.isIntersecting && hasNextPage) {
                callback()
            }
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        })

        if (node) observer.current.observe(node)
    }, [callback, hasNextPage, isFetching])

    return lastElementRef
}

export default useInfiniteScroll