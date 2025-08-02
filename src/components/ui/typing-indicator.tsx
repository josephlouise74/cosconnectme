"use client"

import { cn } from "@/lib/utils"
import Image from "next/image"
import { useEffect, useState } from "react"

interface TypingIndicatorProps {
    isTyping: boolean
    userInfo?: {
        profile_image?: string | undefined
        username?: string | undefined
        first_name?: string | undefined
        last_name?: string | undefined
    }
    className?: string
}

const TypingIndicator = ({ isTyping, userInfo, className }: TypingIndicatorProps) => {
    const [showIndicator, setShowIndicator] = useState(false)

    // Debounce the typing indicator to prevent flickering
    useEffect(() => {
        let timeoutId: NodeJS.Timeout

        if (isTyping) {
            setShowIndicator(true)
        } else {
            timeoutId = setTimeout(() => {
                setShowIndicator(false)
            }, 1000) // Hide after 1 second of no typing
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId)
            }
        }
    }, [isTyping])

    if (!showIndicator) return null

    return (
        <div
            className={cn(
                "flex items-center gap-2 p-3 transition-all duration-300 ease-in-out",
                "animate-in slide-in-from-bottom-2",
                className
            )}
        >
            {/* Profile Image */}
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden flex-shrink-0">
                {userInfo?.profile_image ? (
                    <Image
                        src={userInfo.profile_image}
                        alt="Profile"
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent">
                        <span className="text-xs font-medium text-foreground">
                            {userInfo?.first_name?.[0] ||
                                userInfo?.username?.[0] ||
                                'U'}
                        </span>
                    </div>
                )}
            </div>

            {/* Typing Animation */}
            <div className="flex items-center gap-1 p-2 bg-accent rounded-2xl rounded-bl-md">
                <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                    {userInfo?.first_name && userInfo?.last_name
                        ? `${userInfo.first_name} is typing...`
                        : userInfo?.username
                            ? `${userInfo.username} is typing...`
                            : 'Someone is typing...'
                    }
                </span>
            </div>
        </div>
    )
}

export default TypingIndicator 