"use client"

import type { NotificationItem } from "@/lib/api/notificationsApi"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    MoreVertical,
    Trash2,
    Check,
    Package,
    MessageSquare,
    CreditCard,
    AlertCircle,
    UserCheck,
    UserX,
    ShieldAlert,
    ShieldCheck,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useDeleteNotification, useMarkAsReadNotification } from "@/lib/api/notificationsApi"

interface NotificationCardProps {
    notification: NotificationItem
    userEmail: string
}

const notificationIcons = {
    NEW_COSTUME: Package,
    COMMUNITY_POST: MessageSquare,
    RENTAL_REQUEST: Package,
    RENTAL_APPROVED: Check,
    RENTAL_REJECTED: UserX,
    RENTAL_UPDATED: Package,
    PAYMENT_SUCCESS: CreditCard,
    PAYMENT_FAILED: AlertCircle,
    PAYMENT_REMINDER: CreditCard,
    NEW_MESSAGE: MessageSquare,
    SYSTEM_ALERT: AlertCircle,
    LENDER_VERIFICATION_PENDING: UserCheck,
    LENDER_VERIFICATION_APPROVED: ShieldCheck,
    LENDER_VERIFICATION_REJECTED: ShieldAlert,
    ACCOUNT_SUSPENDED: ShieldAlert,
    ACCOUNT_REACTIVATED: ShieldCheck,
    USER_SIGN_IN: UserCheck,
}

export function NotificationCard({ notification, userEmail }: NotificationCardProps) {
    const Icon = notificationIcons[notification.type] || AlertCircle
    const isUnread = notification.status === "UNREAD"

    const deleteNotificationMutation = useDeleteNotification()
    const markAsReadMutation = useMarkAsReadNotification()

    const isMyNotification = notification.recipient_email === userEmail

    const handleMarkAsRead = () => {
        if (!isMyNotification) return
        markAsReadMutation.mutate(notification.id)
    }

    const handleDelete = () => {
        if (!isMyNotification) return
        deleteNotificationMutation.mutate(notification.id)
    }

    if (!isMyNotification) {
        return null
    }

    return (
        <Card
            className={`group relative overflow-hidden transition-all duration-200 hover:shadow-md ${isUnread
                ? "border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-50/80 to-transparent dark:from-rose-950/30 dark:to-transparent"
                : "bg-card/50 opacity-75 hover:opacity-100"
                }`}
        >
            <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4">
                <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${isUnread ? "bg-rose-100 dark:bg-rose-900/50 ring-2 ring-rose-200 dark:ring-rose-800" : "bg-muted/50"
                        }`}
                >
                    <Icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${isUnread ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground/70"
                            }`}
                    />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-2">
                        <h3
                            className={`text-balance text-sm font-semibold leading-tight ${isUnread ? "text-foreground" : "text-muted-foreground"
                                }`}
                        >
                            {notification.title}
                        </h3>
                        {isUnread && (
                            <span className="relative flex h-2 w-2 shrink-0 mt-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                        )}
                    </div>
                    <p
                        className={`text-pretty text-xs sm:text-sm line-clamp-2 sm:line-clamp-none ${isUnread ? "text-muted-foreground" : "text-muted-foreground/70"
                            }`}
                    >
                        {notification.message}
                    </p>
                    <p className="mt-1.5 sm:mt-2 text-xs text-muted-foreground/60">
                        {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                        })}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {isUnread && (
                            <DropdownMenuItem
                                onClick={handleMarkAsRead}
                                className="gap-2 cursor-pointer"
                                disabled={markAsReadMutation.isPending}
                            >
                                <Check className="h-4 w-4" />
                                {markAsReadMutation.isPending ? "Marking..." : "Mark as read"}
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                            onClick={handleDelete}
                            className="gap-2 cursor-pointer text-rose-600 focus:text-rose-600 dark:text-rose-400 dark:focus:text-rose-400"
                            disabled={deleteNotificationMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4" />
                            {deleteNotificationMutation.isPending ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    )
}
