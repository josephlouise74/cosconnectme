"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Bell, Loader2, AlertCircle, CheckCheck } from "lucide-react"
import { useSupabaseAuth } from "@/lib/hooks/useSupabaseAuth"
import { useGetMyNotifications, useMarkAllNotificationsAsRead } from "@/lib/api/notificationsApi"
import { NotificationCard } from "@/components/Notifications/NotificationCard"

export default function NotificationsPage() {
    const [currentPage, setCurrentPage] = useState(1)
    const limit = 10

    const { user, currentRole, isLoading: isAuthLoading, isAuthenticated } = useSupabaseAuth()

    const { data, isLoading, error } = useGetMyNotifications(
        currentRole || "borrower",
        user?.email || "",
        currentPage,
        limit,
    )

    const markAllAsReadMutation = useMarkAllNotificationsAsRead()

    const notifications = data?.data?.items || []
    const pagination = data?.data?.pagination

    const unreadCount = notifications.filter((n) => n.status === "UNREAD").length

    const handlePreviousPage = () => {
        if (pagination?.hasPreviousPage) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    const handleNextPage = () => {
        if (pagination?.hasNextPage) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    const handleMarkAllAsRead = () => {
        if (!user?.email || !currentRole) return
        markAllAsReadMutation.mutate({
            userId: user.email,
            role: currentRole,
        })
    }

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                    <p className="text-sm text-muted-foreground">Loading authentication...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="h-12 w-12 text-rose-600" />
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="text-sm text-muted-foreground">Please sign in to view your notifications</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950">
                                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <h1 className="text-balance text-2xl sm:text-3xl font-bold tracking-tight">Notifications</h1>
                                <p className="text-pretty text-xs sm:text-sm text-muted-foreground">
                                    {unreadCount > 0
                                        ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                                        : "All caught up!"}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                onClick={handleMarkAllAsRead}
                                disabled={markAllAsReadMutation.isPending}
                                size="sm"
                                variant="outline"
                                className="gap-2 shrink-0 bg-transparent"
                            >
                                <CheckCheck className="h-4 w-4" />
                                <span className="hidden sm:inline">Mark all read</span>
                                <span className="sm:hidden">All read</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                            <p className="text-sm text-muted-foreground">Loading notifications...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 dark:border-rose-900 dark:bg-rose-950/50">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">Failed to load notifications</p>
                                <p className="text-xs text-rose-800 dark:text-rose-200 mt-1">
                                    Please try again later or contact support if the issue persists.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 px-4">
                        <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mb-2 text-lg font-semibold text-center">No notifications yet</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm">
                            When you get notifications, they'll show up here
                        </p>
                    </div>
                )}

                {/* Notifications List */}
                {!isLoading && !error && notifications.length > 0 && (
                    <div className="space-y-2 sm:space-y-3">
                        {notifications.map((notification) => (
                            <NotificationCard key={notification.id} notification={notification} userEmail={user.email || ""} />
                        ))}
                    </div>
                )}

                {!isLoading && !error && pagination && notifications.length > 0 && (
                    <div className="mt-6 sm:mt-8">
                        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-card/50 backdrop-blur-sm p-4 sm:flex-row">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {pagination.page} / {pagination.totalPages}
                                </span>
                                <span className="hidden sm:inline">•</span>
                                <span className="hidden sm:inline">
                                    {pagination.total} total notification{pagination.total !== 1 ? "s" : ""}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePreviousPage}
                                    disabled={!pagination.hasPreviousPage}
                                    className="gap-1.5 min-w-[90px] sm:min-w-[100px] bg-transparent"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNextPage}
                                    className="gap-1.5 min-w-[90px] sm:min-w-[100px] bg-transparent"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
