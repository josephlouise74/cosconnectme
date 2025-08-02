
import { cn } from '@/lib/utils'
import { Clock, Shield, Star } from 'lucide-react'
import React from 'react'

const WhyChooseCosConnectSectio = () => {
    return (
        <section className={cn(
            "py-16",
            "bg-background dark:bg-background-dark",
            "border-t border-border dark:border-border-dark"
        )}>
            <div className="container mx-auto px-4">
                <h2 className={cn(
                    "text-3xl font-bold text-center mb-12 font-heading",
                    "text-text dark:text-text-dark"
                )}>
                    Why Choose CosConnect?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className={cn(
                        "group flex flex-col items-center text-center p-6",
                        "bg-background dark:bg-background-dark",
                        "rounded-lg shadow-sm hover:shadow-lg",
                        "transition-all duration-300",
                        "border border-border dark:border-border-dark",
                        "hover:border-rose-600 hover:bg-rose-600",
                        "hover:text-white dark:hover:text-white"
                    )}>
                        <div className={cn(
                            "h-12 w-12 rounded-full",
                            "bg-rose-100 dark:bg-rose-900",
                            "flex items-center justify-center mb-4",
                            "group-hover:bg-white",
                            "transition-colors"
                        )}>
                            <Star className="h-6 w-6 text-rose-600 group-hover:text-rose-600" />
                        </div>
                        <h3 className={cn(
                            "text-xl font-semibold mb-2 font-heading",
                            "text-text dark:text-text-dark",
                            "group-hover:text-white"
                        )}>
                            For Borrowers
                        </h3>
                        <p className={cn(
                            "text-text-muted dark:text-text-muted-dark",
                            "group-hover:text-white/90",
                            "transition-colors"
                        )}>
                            Find unique costumes at affordable prices. Easy booking and flexible rental periods.
                        </p>
                    </div>
                    <div className={cn(
                        "group flex flex-col items-center text-center p-6",
                        "bg-background dark:bg-background-dark",
                        "rounded-lg shadow-sm hover:shadow-lg",
                        "transition-all duration-300",
                        "border border-border dark:border-border-dark",
                        "hover:border-rose-600 hover:bg-rose-600",
                        "hover:text-white dark:hover:text-white"
                    )}>
                        <div className={cn(
                            "h-12 w-12 rounded-full",
                            "bg-rose-100 dark:bg-rose-900",
                            "flex items-center justify-center mb-4",
                            "group-hover:bg-white",
                            "transition-colors"
                        )}>
                            <Clock className="h-6 w-6 text-rose-600 group-hover:text-rose-600" />
                        </div>
                        <h3 className={cn(
                            "text-xl font-semibold mb-2 font-heading",
                            "text-text dark:text-text-dark",
                            "group-hover:text-white"
                        )}>
                            For Lenders
                        </h3>
                        <p className={cn(
                            "text-text-muted dark:text-text-muted-dark",
                            "group-hover:text-white/90",
                            "transition-colors"
                        )}>
                            Earn money by renting out your costumes. Set your own prices and availability.
                        </p>
                    </div>
                    <div className={cn(
                        "group flex flex-col items-center text-center p-6",
                        "bg-background dark:bg-background-dark",
                        "rounded-lg shadow-sm hover:shadow-lg",
                        "transition-all duration-300",
                        "border border-border dark:border-border-dark",
                        "hover:border-rose-600 hover:bg-rose-600",
                        "hover:text-white dark:hover:text-white"
                    )}>
                        <div className={cn(
                            "h-12 w-12 rounded-full",
                            "bg-rose-100 dark:bg-rose-900",
                            "flex items-center justify-center mb-4",
                            "group-hover:bg-white",
                            "transition-colors"
                        )}>
                            <Shield className="h-6 w-6 text-rose-600 group-hover:text-rose-600" />
                        </div>
                        <h3 className={cn(
                            "text-xl font-semibold mb-2 font-heading",
                            "text-text dark:text-text-dark",
                            "group-hover:text-white"
                        )}>
                            Secure Platform
                        </h3>
                        <p className={cn(
                            "text-text-muted dark:text-text-muted-dark",
                            "group-hover:text-white/90",
                            "transition-colors"
                        )}>
                            Safe transactions, insurance options, and 24/7 support for all users.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default React.memo(WhyChooseCosConnectSectio)
